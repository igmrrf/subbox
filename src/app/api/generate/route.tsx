import fs from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { Author } from "@/store/deck-store";
import sharp from "sharp";

export const runtime = "nodejs";

// Platform configuration matching SlidePreview.tsx
const PLATFORM_CONFIG = {
  twitter: {
    // bg-gradient-to-br from-blue-400 to-cyan-300
    background: "linear-gradient(135deg, #60a5fa, #67e8f9)",
    iconColor: "#60a5fa", // text-blue-400
  },
  linkedin: {
    // bg-gradient-to-br from-blue-700 to-blue-900
    background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
    iconColor: "#1d4ed8", // text-blue-700
  },
  instagram: {
    // bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500
    background: "linear-gradient(45deg, #facc15, #ef4444, #a855f7)",
    iconColor: "#ec4899", // text-pink-500
  },
  tiktok: {
    background: "black",
    iconColor: "black",
  },
};

// Simple SVG paths for icons
const ICONS = {
  twitter: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  ),
  linkedin: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  instagram: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  tiktok: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  ),
  reply: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  share: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 2 5 5-5 5" />
      <path d="M22 7H7a5 5 0 0 0-5 5v5" />
    </svg>
  ),
  heart: (color: string) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let {
      text = "",
      platform = "twitter",
      mode = "light",
      fontSize = "large",
      logo,
      windowChrome = false,
      cardStyle = "solid",
      background: backgroundParam,
      author,
      stats,
      date,
      showFooter = true,
    } = body;

    const safeAuthor = author || Author;
    const safeStats = stats || { likes: 0, replies: 0, shares: 0 };
    const safeDate =
      date ||
      new Date().toLocaleDateString("en-GB", {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour12: true,
      });

    const formatNumber = (num: number) => {
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    // Load default avatar if needed
    let avatarSrc = safeAuthor.avatar;
    if (avatarSrc.startsWith("/")) {
      const filePath = path.join(
        process.cwd(),
        "public",
        avatarSrc.replace(/^\//, ""),
      );
      const avatarBuffer = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();

      if (ext === ".png") {
        avatarSrc = `data:image/png;base64,${avatarBuffer.toString("base64")}`;
      } else {
        // Convert to PNG to ensure Satori compatibility (it struggles with WebP in some envs)
        const pngBuffer = await sharp(avatarBuffer).png().toBuffer();
        avatarSrc = `data:image/png;base64,${pngBuffer.toString("base64")}`;
      }
    }

    // Process logo if it's a non-PNG data URL
    if (
      logo &&
      logo.startsWith("data:image/") &&
      !logo.startsWith("data:image/png")
    ) {
      try {
        const base64Data = logo.split(",")[1];
        if (base64Data) {
          const buffer = Buffer.from(base64Data, "base64");
          const pngBuffer = await sharp(buffer).png().toBuffer();
          logo = `data:image/png;base64,${pngBuffer.toString("base64")}`;
        }
      } catch (e) {
        console.error("Failed to convert logo to PNG:", e);
      }
    }

    if (!text) {
      return new Response("Missing text", { status: 400 });
    }

    // Canvas Dimensions & Scaling
    let width = 1200;
    let height = 675; // 16:9 default (Twitter)

    const platformConfig =
      PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG] ||
      PLATFORM_CONFIG.twitter;
    let background = platformConfig.background;

    if (platform === "linkedin") {
      width = 1080;
      height = 1350; // 4:5
    } else if (platform === "instagram") {
      width = 1080;
      height = 1080; // 1:1
    } else if (platform === "tiktok") {
      width = 1080;
      height = 1920; // 9:16
    }

    if (backgroundParam) {
      background = backgroundParam;
    }

    // Card Styles
    const isDark = mode === "dark";
    // Sync with SlidePreview: bg-white/90 (0.9) vs bg-gray-900/90 (0.9)
    let cardBg = isDark
      ? "rgba(17, 24, 39, 0.9)" // bg-gray-900/90
      : "rgba(255, 255, 255, 0.9)"; // bg-white/90
    let textColor = isDark ? "white" : "#111827"; // text-gray-900
    let borderColor = isDark ? "#374151" : "#e5e7eb"; // border-gray-700 : border-gray-200
    let shadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)"; // shadow-2xl
    let footerBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    if (cardStyle === "glass") {
      // Sync with SlidePreview: bg-white/60 (0.6) vs bg-gray-900/60 (0.6)
      cardBg = isDark ? "rgba(17, 24, 39, 0.6)" : "rgba(255, 255, 255, 0.6)";
    } else if (cardStyle === "flat") {
      cardBg = isDark ? "#111827" : "#ffffff";
      shadow = "none";
    }

    // Adaptive Font Sizing Logic - Scaled up ~2.4x from Tailwind
    const textLength = text.length;
    const SCALE = 2.4;
    const s = (val: number) => Math.round(val * SCALE);

    let fontSizePx = s(30); // Default text-3xl (30px)

    if (fontSize === "huge") {
      if (textLength > 200)
        fontSizePx = s(20); // text-xl (20px)
      else if (textLength > 100)
        fontSizePx = s(24); // text-2xl (24px)
      else fontSizePx = s(30); // text-3xl (30px)
    } else if (fontSize === "large") {
      if (textLength > 250)
        fontSizePx = s(16); // text-base (16px)
      else if (textLength > 150)
        fontSizePx = s(18); // text-lg (18px)
      else fontSizePx = s(20); // text-xl (20px)
    } else {
      // medium
      if (textLength > 200)
        fontSizePx = s(14); // text-sm (14px)
      else fontSizePx = s(16); // text-base (16px)
    }

    // Icon
    // @ts-ignore
    const PlatformIcon = ICONS[platform] || ICONS.twitter;
    // SlidePreview uses platform color for icon in chrome
    const iconColor = platformConfig.iconColor;

    const fontData = await fs.promises.readFile(
      path.join(process.cwd(), "public", "Inter-Medium.woff"),
    );

    // Padding scaling
    // Outer: p-8 (32px) * 2.4 = ~77px
    const outerPadding = s(32);
    // Inner: p-6 (24px) * 2.4 = ~58px
    const innerPadding = s(24);

    const containerStyle: React.CSSProperties = {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: outerPadding,
      fontFamily: '"Inter"',
      ...(background.includes("gradient")
        ? { backgroundImage: background }
        : { backgroundColor: background }),
    };

    const innerCardStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      backgroundColor: cardBg,
      borderRadius: s(12), // rounded-xl (12px)
      boxShadow: shadow,
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      overflow: "hidden",
      ...(cardStyle !== "flat" ? { border: `1px solid ${borderColor}` } : {}),
    };

    const svg = await satori(
      <div style={containerStyle}>
        <div style={innerCardStyle}>
          {/* Window Chrome */}
          {windowChrome && (
            <div
              style={{
                height: s(48), // h-12 (48px)
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: s(16), // px-4 (16px)
                paddingRight: s(16),
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <div style={{ display: "flex", gap: s(8) }}>
                {" "}
                {/* gap-2 (8px) */}
                <div
                  style={{
                    width: s(12), // w-3 (12px)
                    height: s(12),
                    borderRadius: "50%",
                    backgroundColor: "#FF5F56",
                  }}
                />
                <div
                  style={{
                    width: s(12),
                    height: s(12),
                    borderRadius: "50%",
                    backgroundColor: "#FFBD2E",
                  }}
                />
                <div
                  style={{
                    width: s(12),
                    height: s(12),
                    borderRadius: "50%",
                    backgroundColor: "#27C93F",
                  }}
                />
              </div>

              <div style={{ display: "flex", opacity: 0.7 }}>
                {logo ? (
                  <img
                    src={logo}
                    width={s(24)}
                    height={s(24)}
                    style={{
                      borderRadius: "50%",
                      objectFit: "contain",
                    }}
                    alt=""
                  />
                ) : (
                  PlatformIcon(iconColor)
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: innerPadding,
              flex: 1,
            }}
          >
            {/* User Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: s(12),
                marginBottom: s(24),
              }}
            >
              <div
                style={{
                  width: s(48),
                  height: s(48),
                  borderRadius: "50%",
                  backgroundColor: "#ffedd5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  alt="avatar"
                  src={avatarSrc}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{ fontWeight: 700, fontSize: s(18), color: textColor }}
                >
                  {safeAuthor.name}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: fontSizePx,
                color: textColor,
                lineHeight: 1.6, // leading-relaxed
                whiteSpace: "pre-wrap",
                fontWeight: 500,
                flex: 1,
                marginBottom: s(24),
              }}
            >
              {text}
            </div>

            {/* Footer Meta */}
            {showFooter && (
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: s(16),
                  borderTop: `1px solid ${footerBorder}`,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: s(14),
                    marginBottom: s(12),
                    fontWeight: 500,
                    display: "flex",
                  }}
                >
                  {safeDate}
                </div>
                <div
                  style={{ display: "flex", gap: s(24), alignItems: "center" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: s(8) }}
                  >
                    <div style={{ color: "#6b7280", display: "flex" }}>
                      {ICONS.reply("#6b7280")}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontWeight: 700,
                        fontSize: s(14),
                      }}
                    >
                      {formatNumber(safeStats.replies)}{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          color: "#6b7280",
                          marginLeft: s(4),
                        }}
                      ></span>
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: s(8) }}
                  >
                    <div style={{ color: "#6b7280", display: "flex" }}>
                      {ICONS.share("#6b7280")}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontWeight: 700,
                        fontSize: s(14),
                      }}
                    >
                      {formatNumber(safeStats.shares)}{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          color: "#6b7280",
                          marginLeft: s(4),
                        }}
                      ></span>
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: s(8) }}
                  >
                    <div style={{ color: "#6b7280", display: "flex" }}>
                      {ICONS.heart("#6b7280")}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontWeight: 700,
                        fontSize: s(14),
                      }}
                    >
                      {formatNumber(safeStats.likes)}{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          color: "#6b7280",
                          marginLeft: s(4),
                        }}
                      ></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>,
      {
        width,
        height,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 500,
          },
        ],
      },
    );

    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: width,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
