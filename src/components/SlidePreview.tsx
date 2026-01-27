"use client";

import { Author, useDeckStore, type Slide } from "@/store/deck-store";
import clsx from "clsx";
import {
  Twitter,
  Linkedin,
  Instagram,
  Smartphone,
  MessageCircle,
  Repeat2,
  Heart,
} from "lucide-react";

const PLATFORM_STYLES = {
  twitter: {
    aspectRatio: "16/9",
    backgroundClass: "bg-gradient-to-br from-blue-400 to-cyan-300",
    Icon: Twitter,
    iconColor: "text-blue-400",
  },
  linkedin: {
    aspectRatio: "4/5",
    backgroundClass: "bg-gradient-to-br from-blue-700 to-blue-900",
    Icon: Linkedin,
    iconColor: "text-blue-700",
  },
  instagram: {
    aspectRatio: "1/1",
    backgroundClass:
      "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500",
    Icon: Instagram,
    iconColor: "text-pink-500",
  },
  tiktok: {
    aspectRatio: "9/16",
    backgroundClass: "bg-black",
    Icon: Smartphone,
    iconColor: "text-black",
  },
} as const;

export function SlidePreview({
  content,
  theme,
  author,
  stats,
  date,
}: {
  content: string;
  theme?: string;
  author?: Slide["author"];
  stats?: Slide["stats"];
  date?: string;
}) {
  const { globalTheme } = useDeckStore();

  const safeAuthor = globalTheme.author || author || Author;
  const safeStats = stats || { likes: 0, replies: 0, shares: 0 };
  const safeDate =
    date ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  console.log({
    date,
    upda: new Date().toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  });
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Use local theme (from prop) if available and valid, otherwise global
  const platformKey =
    (theme as keyof typeof PLATFORM_STYLES) || globalTheme.platform;
  const style = PLATFORM_STYLES[platformKey] || PLATFORM_STYLES.twitter;

  const isDark = globalTheme.mode === "dark";

  // Card styling
  let cardBgClass = isDark
    ? "bg-gray-900/90 text-white"
    : "bg-white/90 text-gray-900";
  const cardBorderClass = isDark ? "border-gray-700" : "border-gray-200";
  let shadowClass = "shadow-2xl";
  let backdropClass = "";

  if (globalTheme.cardStyle === "glass") {
    cardBgClass = isDark
      ? "bg-gray-900/60 text-white"
      : "bg-white/60 text-gray-900";
    backdropClass = "backdrop-blur-xl";
  } else if (globalTheme.cardStyle === "flat") {
    shadowClass = "shadow-none";
    cardBgClass = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }

  // Chrome dots colors
  const dotColors = {
    red: "bg-[#FF5F56]",
    yellow: "bg-[#FFBD2E]",
    green: "bg-[#27C93F]",
  };

  // Adaptive Font Sizing Logic
  const textLength = content?.length || 0;
  let sizeClass = "";

  if (globalTheme.fontSize === "huge") {
    if (textLength > 100) sizeClass = "text-2xl";
    else if (textLength > 200) sizeClass = "text-xl";
    else sizeClass = "text-3xl";
  } else if (globalTheme.fontSize === "large") {
    if (textLength > 150) sizeClass = "text-lg";
    else if (textLength > 250) sizeClass = "text-base";
    else sizeClass = "text-xl";
  } else {
    // medium
    if (textLength > 200) sizeClass = "text-sm";
    else sizeClass = "text-base";
  }

  return (
    <div className="w-full h-full min-h-[500px] flex justify-center items-center bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg overflow-y-auto">
      <div
        style={{
          // We use style.aspectRatio as a baseline, but allow growing
          // If we just use aspectRatio in CSS, it might constrain height.
          // Instead, let's use a min-height calculation or just allow auto.
          // For now, let's remove strict aspectRatio from style to allow growth,
          // but maybe apply a min-width/height to simulate the shape?
          // Actually, "aspect-ratio" property in modern CSS *does* allow content to push it if min-height is auto?
          // No, usually it preserves ratio.
          // Let's set it as a customized class or style if needed, but the user requested "auto fit".
          // We'll keep the background/padding wrapper.
          ...(globalTheme.background && {
            background: globalTheme.background,
          }),
        }}
        className={clsx(
          "w-full max-w-[600px] flex items-center justify-center p-8 md:p-12 relative transition-all duration-300",
          !globalTheme.background && style.backgroundClass,
          // Use a class to enforce ratio ONLY if content is small?
          // Or just remove ratio constraint to ensure "never go out of view"?
          // The user said "aspectRatio and other information" is important, so we should try to keep it
          // BUT expand if needed.
        )}
      >
        {/* We wrap the card in a div that enforces the ratio as a MINIMUM, 
              or just apply the ratio to this wrapper but allow overflow-visible? 
              If we want the background to grow, the wrapper must grow. 
          */}
        <div
          className={clsx(
            "w-full h-full rounded-xl flex flex-col transition-all duration-300",
            // Removed overflow-hidden to allow growth? No, we want the card to grow.
            // If we remove h-full, it will grow.
            "min-h-[300px]",
            cardBgClass,
            shadowClass,
            backdropClass,
            globalTheme.cardStyle !== "flat" && "border",
            cardBorderClass,
          )}
          style={{
            // If we want to emulate the aspect ratio, we can try, but prioritizing content fit:
            aspectRatio: style.aspectRatio,
          }}
        >
          {globalTheme.windowChrome && (
            <div
              className={clsx(
                "h-12 shrink-0 w-full flex items-center justify-between px-4 border-b",
                isDark ? "border-white/10" : "border-black/5",
              )}
            >
              <div className="flex gap-2">
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full shadow-sm",
                    dotColors.red,
                  )}
                />
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full shadow-sm",
                    dotColors.yellow,
                  )}
                />
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full shadow-sm",
                    dotColors.green,
                  )}
                />
              </div>
              <div className="opacity-70">
                {globalTheme.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={globalTheme.logo}
                    alt="Logo"
                    className="w-6 h-6 object-contain rounded-full"
                  />
                ) : (
                  <style.Icon size={24} />
                )}
              </div>
            </div>
          )}

          <div className="p-8 md:p-10 flex-1 flex flex-col relative">
            {/* User Header */}
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={safeAuthor.avatar}
                  alt={safeAuthor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={clsx(
                    "font-bold text-lg leading-tight",
                    isDark ? "text-white" : "text-black",
                  )}
                >
                  {safeAuthor.name}
                </span>
                {safeAuthor.handle && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {safeAuthor.handle}
                  </span>
                )}
              </div>
            </div>

            <div
              className={clsx(
                "font-medium whitespace-pre-wrap leading-relaxed mb-6",
                sizeClass,
              )}
            >
              {content || "Start typing..."}
            </div>

            {/* Footer Meta */}
            {(globalTheme.showFooter ?? true) && (
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50 shrink-0">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-medium opacity-80">
                  {safeDate}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 transition-colors">
                      <MessageCircle size={18} />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                      {formatNumber(safeStats.replies)}{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 text-gray-500 dark:text-gray-400 transition-colors">
                      <Repeat2 size={18} />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                      {formatNumber(safeStats.shares)}{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-full group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 text-gray-500 dark:text-gray-400 transition-colors">
                      <Heart size={18} />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                      {formatNumber(safeStats.likes)}{" "}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
