"use client";

import clsx from "clsx";
import {
  Battery,
  X as CloseIcon,
  Heart,
  Instagram,
  Linkedin,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  Repeat2,
  Signal,
  Smartphone,
  Square,
  Twitter,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type Annotation,
  Author,
  type Slide,
  type SlideLayout,
  type SlideType,
  useDeckStore,
} from "@/store/deck-store";
import { useHighlighter } from "@/utils/highlighter";
import { AnnotationLayer } from "./AnnotationLayer";

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

function EditableContent({
  content,
  type,
  language,
  isDark,
  className,
  onUpdate,
  onPaste,
  placeholder,
}: {
  content: string;
  type?: SlideType;
  language?: string;
  isDark: boolean;
  className?: string;
  onUpdate: (val: string) => void;
  onPaste?: (val: string) => void;
  placeholder?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Determine language for highlighting
  let highlightLang = "text";
  if (type === "code" || type === "hybrid")
    highlightLang = language || "javascript";
  if (type === "diff") highlightLang = "diff";

  const html = useHighlighter(
    content,
    highlightLang,
    isDark ? "dark" : "light",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [isEditing]);

  const handlePaste = (e: React.ClipboardEvent) => {
    if (onPaste) {
      const pastedText = e.clipboardData.getData("text");
      if (pastedText) {
        onPaste(pastedText);
      }
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onUpdate(e.target.value)}
        onBlur={() => setIsEditing(false)}
        onPaste={handlePaste}
        className={clsx(
          className,
          "w-full h-full bg-transparent outline-none resize-none border-none p-0 m-0 overflow-hidden",
          "focus:ring-0",
          type === "code" && "font-mono",
        )}
        placeholder={placeholder}
        style={{ fontFamily: type === "code" ? "monospace" : "inherit" }}
      />
    );
  }

  if ((type === "code" || type === "hybrid" || type === "diff") && html) {
    return (
      <div
        className={clsx(className, "cursor-text min-h-[1.5em] relative")}
        onClick={() => setIsEditing(true)}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontFamily: "monospace" }}
      />
    );
  }

  return (
    <div
      className={clsx(
        className,
        "cursor-text min-h-[1.5em] whitespace-pre-wrap relative",
      )}
      onClick={() => setIsEditing(true)}
    >
      {content || <span className="opacity-40">{placeholder}</span>}
    </div>
  );
}

export function SlidePreview({
  slideId,
  content,
  layout = "single",
  type = "social",
  language = "javascript",
  theme,
  author,
  stats,
  date,
  annotations = [],
  onUpdateContent,
  onUpdateAnnotation,
  onAddAnnotation,
  onRemoveAnnotation,
  onPaste,
}: {
  slideId: string;
  content: Slide["content"];
  layout?: SlideLayout;
  type?: SlideType;
  language?: string;
  theme?: string;
  author?: Slide["author"];
  stats?: Slide["stats"];
  date?: string;
  annotations?: Annotation[];
  onUpdateContent?: (primary: string, secondary?: string) => void;
  onUpdateAnnotation?: (id: string, updates: Partial<Annotation>) => void;
  onAddAnnotation?: (annotation: Annotation) => void;
  onRemoveAnnotation?: (id: string) => void;
  onPaste?: (val: string) => void;
}) {
  const { globalTheme } = useDeckStore();
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);

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

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platformKey =
    (theme as keyof typeof PLATFORM_STYLES) || globalTheme.platform;
  const style = PLATFORM_STYLES[platformKey] || PLATFORM_STYLES.twitter;

  const isDark = globalTheme.mode === "dark";

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

  const dotColors = {
    red: "bg-[#FF5F56]",
    yellow: "bg-[#FFBD2E]",
    green: "bg-[#27C93F]",
  };

  const textLength = content.primary?.length || 0;
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
    if (textLength > 200) sizeClass = "text-sm";
    else sizeClass = "text-base";
  }

  if (type === "code") {
    sizeClass = "text-sm md:text-base";
  }

  const handleUpdatePrimary = (val: string) => {
    onUpdateContent?.(val, content.secondary);
  };

  const handleUpdateSecondary = (val: string) => {
    onUpdateContent?.(content.primary, val);
  };

  const handleAddArrow = () => {
    onAddAnnotation?.({
      id: uuidv4(),
      type: "arrow",
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      color: "red",
    });
  };

  const handleAddCircle = () => {
    onAddAnnotation?.({
      id: uuidv4(),
      type: "circle",
      x: 200,
      y: 200,
      width: 40,
      height: 40,
      color: "red",
    });
  };

  const currentFrame =
    globalTheme.frameStyle || (globalTheme.windowChrome ? "macos" : "none");

  return (
    <div className="w-full h-full min-h-[400px] flex justify-center items-center bg-gray-100/50 dark:bg-gray-900/20 p-4 md:p-12 rounded-2xl overflow-hidden relative group">
      {/* Annotation Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          type="button"
          onClick={() => setShowAnnotationTools(!showAnnotationTools)}
          className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-500 hover:text-blue-500 transition-all hover:scale-110"
          title="Annotations"
        >
          <Pencil size={18} />
        </button>

        {showAnnotationTools && (
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleAddArrow}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs font-bold"
              title="Add Arrow"
            >
              <Plus size={14} className="rotate-45" /> Arrow
            </button>
            <button
              type="button"
              onClick={handleAddCircle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs font-bold"
              title="Add Circle"
            >
              <div className="w-4 h-4 border-2 border-current rounded-full" />{" "}
              Circle
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          ...(globalTheme.background && {
            background: globalTheme.background,
          }),
        }}
        className={clsx(
          "w-full max-w-[600px] flex items-center justify-center p-6 md:p-14 relative transition-all duration-500 ease-out rounded-[2rem] md:rounded-[3rem]",
          !globalTheme.background && style.backgroundClass,
        )}
      >
        <div
          className={clsx(
            "w-full h-auto rounded-2xl md:rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden",
            "min-h-[200px]",
            cardBgClass,
            shadowClass,
            backdropClass,
            globalTheme.cardStyle !== "flat" && "border",
            cardBorderClass,
          )}
        >
          {/* Annotation Layer */}
          <AnnotationLayer
            slideId={slideId}
            annotations={annotations}
            onUpdateAnnotation={onUpdateAnnotation}
            onRemoveAnnotation={onRemoveAnnotation}
          />

          {/* Frame Header */}
          {currentFrame === "macos" && (
            <div
              className={clsx(
                "h-12 shrink-0 w-full flex items-center justify-between px-6 border-b relative z-10",
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
              <div className="opacity-70 truncate max-w-[150px] flex justify-end">
                {globalTheme.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={globalTheme.logo}
                    alt="Logo"
                    className="w-6 h-6 object-contain rounded-full"
                  />
                ) : (
                  <style.Icon size={20} />
                )}
              </div>
            </div>
          )}

          {currentFrame === "windows" && (
            <div
              className={clsx(
                "h-10 shrink-0 w-full flex items-center justify-between px-5 border-b relative z-10 bg-gray-50/50 dark:bg-gray-800/50",
                isDark ? "border-white/10" : "border-black/5",
              )}
            >
              <div className="flex items-center gap-2 max-w-[200px] truncate">
                <div className="opacity-60 shrink-0">
                  {globalTheme.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={globalTheme.logo}
                      alt="Logo"
                      className="w-4 h-4 object-contain"
                    />
                  ) : (
                    <style.Icon size={14} />
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                  Project Deck
                </span>
              </div>
              <div className="flex gap-4">
                <Minus size={14} className="text-gray-400" />
                <Square size={10} className="text-gray-400" />
                <CloseIcon size={14} className="text-gray-400" />
              </div>
            </div>
          )}

          {currentFrame === "phone" && (
            <div className="h-8 shrink-0 w-full flex items-center justify-between px-8 pt-4 relative z-10">
              <div className="text-[11px] font-bold text-gray-900 dark:text-gray-100">
                9:41
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 h-6 w-28 bg-black rounded-b-2xl" />
              <div className="flex gap-1.5 text-gray-900 dark:text-gray-100">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={12} />
              </div>
            </div>
          )}

          <div className="p-8 md:p-12 flex-1 flex flex-col relative z-10">
            <div className="flex items-center gap-4 mb-8 shrink-0">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
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
                    "font-bold text-xl leading-tight tracking-tight",
                    isDark ? "text-white" : "text-black",
                  )}
                >
                  {safeAuthor.name}
                </span>
                {safeAuthor.handle && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium opacity-70">
                    {safeAuthor.handle}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 mb-8 relative break-words">
              {layout === "split" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  <EditableContent
                    content={content.primary}
                    type={type}
                    language={language}
                    isDark={isDark}
                    className={clsx(
                      "font-medium leading-relaxed break-words",
                      sizeClass,
                    )}
                    onUpdate={handleUpdatePrimary}
                    onPaste={onPaste}
                    placeholder="Primary content..."
                  />
                  <EditableContent
                    content={content.secondary || ""}
                    type={type === "code" ? "text" : type}
                    language={undefined}
                    isDark={isDark}
                    className={clsx(
                      "font-medium leading-relaxed opacity-60 break-words",
                      sizeClass,
                    )}
                    onUpdate={handleUpdateSecondary}
                    placeholder="Secondary content..."
                  />
                </div>
              ) : layout === "stack" ? (
                <div className="flex flex-col gap-8 h-full">
                  <EditableContent
                    content={content.primary}
                    type={type}
                    language={language}
                    isDark={isDark}
                    className={clsx(
                      "font-medium leading-relaxed break-words",
                      sizeClass,
                    )}
                    onUpdate={handleUpdatePrimary}
                    onPaste={onPaste}
                    placeholder="Primary content..."
                  />
                  <EditableContent
                    content={content.secondary || ""}
                    type={type === "code" ? "text" : type}
                    language={undefined}
                    isDark={isDark}
                    className={clsx(
                      "font-medium leading-relaxed opacity-60 break-words",
                      sizeClass,
                    )}
                    onUpdate={handleUpdateSecondary}
                    placeholder="Secondary content..."
                  />
                </div>
              ) : (
                <EditableContent
                  content={content.primary}
                  type={type}
                  language={language}
                  isDark={isDark}
                  className={clsx(
                    "font-medium leading-relaxed break-words",
                    sizeClass,
                  )}
                  onUpdate={handleUpdatePrimary}
                  onPaste={onPaste}
                  placeholder={
                    type === "code"
                      ? "// Start typing code..."
                      : "Start typing..."
                  }
                />
              )}
            </div>

            {(globalTheme.showFooter ?? true) && (
              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800/50 shrink-0">
                <div className="text-gray-400 dark:text-gray-500 text-[11px] mb-4 font-bold uppercase tracking-widest opacity-80">
                  {safeDate}
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2.5 group">
                    <div className="p-2 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 text-gray-400 transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <span
                      className={clsx(
                        "font-bold text-sm",
                        isDark ? "text-gray-200" : "text-gray-900",
                      )}
                    >
                      {formatNumber(safeStats.replies)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 group">
                    <div className="p-2 rounded-xl group-hover:bg-green-50 dark:group-hover:bg-green-900/20 text-gray-400 transition-colors">
                      <Repeat2 size={20} />
                    </div>
                    <span
                      className={clsx(
                        "font-bold text-sm",
                        isDark ? "text-gray-200" : "text-gray-900",
                      )}
                    >
                      {formatNumber(safeStats.shares)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 group">
                    <div className="p-2 rounded-xl group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 text-gray-400 transition-colors">
                      <Heart size={20} />
                    </div>
                    <span
                      className={clsx(
                        "font-bold text-sm",
                        isDark ? "text-gray-200" : "text-gray-900",
                      )}
                    >
                      {formatNumber(safeStats.likes)}
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
