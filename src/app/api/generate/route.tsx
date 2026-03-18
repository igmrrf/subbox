import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { type NextRequest, NextResponse } from "next/server";
import satori from "satori";
import sharp from "sharp";
import { codeToTokens } from "shiki";
import { Author } from "@/store/deck-store";

export const runtime = "nodejs";

const PLATFORM_CONFIG = {
  twitter: {
    background: "linear-gradient(135deg, #60a5fa, #67e8f9)",
    iconColor: "#60a5fa",
  },
  linkedin: {
    background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
    iconColor: "#1d4ed8",
  },
  instagram: {
    background: "linear-gradient(45deg, #facc15, #ef4444, #a855f7)",
    iconColor: "#ec4899",
  },
  tiktok: {
    background: "black",
    iconColor: "black",
  },
};

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
  battery: (color: string) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
      <line x1="22" x2="22" y1="11" y2="13" />
    </svg>
  ),
  wifi: (color: string) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h.01" />
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <path d="M5 12.859a10 10 0 0 1 14 0" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
    </svg>
  ),
  signal: (color: string) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 20V4" />
    </svg>
  ),
  minus: (color: string) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  ),
  square: (color: string) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  ),
  close: (color: string) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      text = "",
      secondaryText = "",
      layout = "single",
      platform = "twitter",
      mode = "light",
      fontSize = "large",
      logo,
      frame: frameParam,
      windowChrome,
      cardStyle = "solid",
      background: backgroundParam,
      author,
      stats,
      date,
      showFooter = true,
      type = "social",
      language = "javascript",
    } = body;

    const currentFrame =
      frameParam || (windowChrome === false ? "none" : "macos");

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

    let avatarSrc = safeAuthor.avatar;
    if (avatarSrc.startsWith("/")) {
      const filePath = path.join(
        process.cwd(),
        "public",
        avatarSrc.replace(/^\//, ""),
      );
      const avatarBuffer = await fs.promises.readFile(filePath);
      const pngBuffer = await sharp(avatarBuffer).png().toBuffer();
      avatarSrc = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    }

    if (logo?.startsWith("data:image/") && !logo.startsWith("data:image/png")) {
      try {
        const base64Data = logo.split(",")[1];
        if (base64Data) {
          const buffer = Buffer.from(base64Data, "base64");
          const pngBuffer = await sharp(buffer).png().toBuffer();
          logo = `data:image/png;base64,${pngBuffer.toString("base64")}`;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const SCALE = 2.4;
    const s = (val: number) => Math.round(val * SCALE);

    let width = 1200;
    let height = 675;
    const platformKey = (platform as keyof typeof PLATFORM_CONFIG) || "twitter";
    const platformConfig =
      PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG.twitter;
    const PlatformIcon =
      ICONS[platformKey as keyof typeof ICONS] || ICONS.twitter;
    const iconColor = platformConfig.iconColor;

    const background = backgroundParam || platformConfig.background;

    if (platform === "linkedin") {
      width = 1080;
      height = 1350;
    } else if (platform === "instagram") {
      width = 1080;
      height = 1080;
    } else if (platform === "tiktok") {
      width = 1080;
      height = 1920;
    }

    const isDark = mode === "dark";
    let cardBg = isDark ? "rgba(17, 24, 39, 0.9)" : "rgba(255, 255, 255, 0.9)";
    const textColor = isDark ? "white" : "#111827";
    const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";
    const borderColor = isDark ? "#374151" : "#e5e7eb";
    let shadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";

    if (cardStyle === "glass") {
      cardBg = isDark ? "rgba(17, 24, 39, 0.6)" : "rgba(255, 255, 255, 0.6)";
    } else if (cardStyle === "flat") {
      cardBg = isDark ? "#111827" : "#ffffff";
      shadow = "none";
    }

    const textLength = text.length;
    let fontSizePx = s(30);
    if (fontSize === "huge") {
      if (textLength > 200) fontSizePx = s(20);
      else if (textLength > 100) fontSizePx = s(24);
      else fontSizePx = s(30);
    } else if (fontSize === "large") {
      if (textLength > 250) fontSizePx = s(16);
      else if (textLength > 150) fontSizePx = s(18);
      else fontSizePx = s(20);
    } else {
      if (textLength > 200) fontSizePx = s(14);
      else fontSizePx = s(16);
    }

    const fontData = await fs.promises.readFile(
      path.join(process.cwd(), "public", "Inter-Medium.woff"),
    );

    let contentNode: React.ReactNode = text;
    if (type === "code" || type === "hybrid" || type === "diff") {
      try {
        const lang = type === "diff" ? "diff" : language || "javascript";
        const { tokens } = await codeToTokens(text, {
          lang,
          theme: isDark ? "catppuccin-macchiato" : "github-light",
        });
        contentNode = (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {tokens.map((line, i) => (
              <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>
                {line.map((token, j) => (
                  <span key={j} style={{ color: token.color }}>
                    {token.content}
                  </span>
                ))}
              </div>
            ))}
          </div>
        );
      } catch (_e) {
        contentNode = text;
      }
    }

    const svg = await satori(
      <div
        style={{
          minHeight: height,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: s(60),
          fontFamily: '"Inter"',
          ...(background.includes("gradient")
            ? { backgroundImage: background }
            : { backgroundColor: background }),
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: cardBg,
            borderRadius: s(24),
            boxShadow: shadow,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            ...(cardStyle !== "flat"
              ? { border: `1px solid ${borderColor}` }
              : {}),
          }}
        >
          {/* Frame Headers */}
          {currentFrame === "macos" && (
            <div
              style={{
                height: s(48),
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: s(24),
                paddingRight: s(24),
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <div style={{ display: "flex", gap: s(10) }}>
                <div
                  style={{
                    width: s(12),
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
                    style={{ borderRadius: "50%" }}
                    alt=""
                  />
                ) : (
                  PlatformIcon(iconColor)
                )}
              </div>
            </div>
          )}

          {currentFrame === "windows" && (
            <div
              style={{
                height: s(40),
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: s(20),
                paddingRight: s(20),
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: s(8) }}>
                <div style={{ display: "flex", opacity: 0.6 }}>
                  {logo ? (
                    <img src={logo} width={s(16)} height={s(16)} alt="" />
                  ) : (
                    PlatformIcon(secondaryTextColor)
                  )}
                </div>
                <div
                  style={{
                    fontSize: s(10),
                    color: secondaryTextColor,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Project Deck
                </div>
              </div>
              <div
                style={{ display: "flex", gap: s(16), alignItems: "center" }}
              >
                {ICONS.minus(secondaryTextColor)}
                {ICONS.square(secondaryTextColor)}
                {ICONS.close(secondaryTextColor)}
              </div>
            </div>
          )}

          {currentFrame === "phone" && (
            <div
              style={{
                height: s(36),
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: s(32),
                paddingRight: s(32),
                paddingTop: s(12),
                position: "relative",
              }}
            >
              <div
                style={{ fontSize: s(12), fontWeight: 700, color: textColor }}
              >
                9:41
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  transform: "translateX(-50%)",
                  height: s(24),
                  width: s(110),
                  backgroundColor: "black",
                  borderBottomLeftRadius: s(16),
                  borderBottomRightRadius: s(16),
                }}
              />
              <div style={{ display: "flex", gap: s(6), color: textColor }}>
                {ICONS.signal(textColor)}
                {ICONS.wifi(textColor)}
                {ICONS.battery(textColor)}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: s(40),
              flex: 1,
            }}
          >
            {/* User Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: s(16),
                marginBottom: s(32),
              }}
            >
              <div
                style={{
                  width: s(56),
                  height: s(56),
                  borderRadius: "50%",
                  display: "flex",
                  overflow: "hidden",
                  border: `2px solid ${isDark ? "#374151" : "white"}`,
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
                  style={{
                    fontWeight: 800,
                    fontSize: s(20),
                    color: textColor,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {safeAuthor.name}
                </span>
                {safeAuthor.handle && (
                  <span
                    style={{
                      fontSize: s(14),
                      color: secondaryTextColor,
                      marginTop: s(2),
                      fontWeight: 500,
                    }}
                  >
                    {safeAuthor.handle}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                width: "100%",
                marginBottom: s(32),
              }}
            >
              {layout === "split" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    gap: s(32),
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      fontSize: fontSizePx,
                      color: textColor,
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {contentNode}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: fontSizePx,
                      color: textColor,
                      lineHeight: 1.6,
                      fontWeight: 500,
                      opacity: 0.6,
                    }}
                  >
                    {secondaryText}
                  </div>
                </div>
              ) : layout === "stack" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: s(32),
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: fontSizePx,
                      color: textColor,
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {contentNode}
                  </div>
                  <div
                    style={{
                      fontSize: fontSizePx,
                      color: textColor,
                      lineHeight: 1.6,
                      fontWeight: 500,
                      opacity: 0.6,
                    }}
                  >
                    {secondaryText}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: fontSizePx,
                    color: textColor,
                    lineHeight: 1.6,
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {contentNode}
                </div>
              )}
            </div>

            {showFooter && (
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: s(24),
                  borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    color: secondaryTextColor,
                    fontSize: s(11),
                    marginBottom: s(16),
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {safeDate}
                </div>
                <div
                  style={{ display: "flex", gap: s(32), alignItems: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: s(10),
                    }}
                  >
                    <div style={{ color: secondaryTextColor, display: "flex" }}>
                      {ICONS.reply(secondaryTextColor)}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontWeight: 800,
                        fontSize: s(14),
                      }}
                    >
                      {formatNumber(safeStats.replies)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: s(10),
                    }}
                  >
                    <div style={{ color: secondaryTextColor, display: "flex" }}>
                      {ICONS.share(secondaryTextColor)}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontWeight: 800,
                        fontSize: s(14),
                      }}
                    >
                      {formatNumber(safeStats.shares)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: s(10),
                    }}
                  >
                    <div style={{ color: secondaryTextColor, display: "flex" }}>
                      {ICONS.heart(secondaryTextColor)}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontWeight: 800,
                        fontSize: s(14),
                      }}
                    >
                      {formatNumber(safeStats.likes)}
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
        fonts: [
          { name: "Inter", data: fontData, style: "normal", weight: 500 },
        ],
      },
    );

    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
    const pngBuffer = resvg.render().asPng();

    return new Response(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
