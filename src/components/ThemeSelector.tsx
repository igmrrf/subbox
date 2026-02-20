import clsx from "clsx";
import {
  ChevronDown,
  ChevronUp,
  Instagram,
  Linkedin,
  Palette,
  RefreshCcw,
  Smartphone,
  Twitter,
  Upload,
  User,
  Wand2,
  X,
  LayoutTemplate,
  Monitor,
  Maximize,
  Minimize,
} from "lucide-react";
import { useState } from "react";
import { PRESET_AVATARS } from "@/constants/avatars";
import { Author, useDeckStore, type SlideFrame } from "@/store/deck-store";
import { extractColors } from "@/utils/colorExtractor";

const PLATFORMS = [
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Smartphone },
] as const;

const FRAMES: { id: SlideFrame; label: string; icon: any }[] = [
    { id: "macos", label: "MacOS", icon: LayoutTemplate },
    { id: "windows", label: "Windows", icon: Monitor },
    { id: "phone", label: "Phone", icon: Smartphone },
    { id: "none", label: "None", icon: Maximize },
];

const PRESET_GRADIENTS = [
  "linear-gradient(to bottom right, #f472b6, #d8b4fe, #818cf8)", // Sunset
  "linear-gradient(to bottom right, #2dd4bf, #3b82f6, #6366f1)", // Ocean
  "linear-gradient(to bottom right, #fbbf24, #f87171, #ef4444)", // Heat
  "linear-gradient(to bottom right, #34d399, #10b981, #059669)", // Forest
  "linear-gradient(to bottom right, #1f2937, #111827, #000000)", // Dark
  "linear-gradient(to bottom right, #ffffff, #f3f4f6, #e5e7eb)", // Light
];

export function ThemeSelector() {
  const { globalTheme, setGlobalTheme } = useDeckStore();
  const [customColors, setCustomColors] = useState({
    start: "#3b82f6",
    end: "#9333ea",
  });
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  const currentAuthor = globalTheme.author || Author;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const logoSrc = reader.result as string;
        
        // Extract colors
        try {
            const colors = await extractColors(logoSrc);
            setGlobalTheme({ 
                logo: logoSrc,
                brandColors: colors,
                // Automatically set a gradient from the first two colors if available
                background: colors.length >= 2 
                    ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` 
                    : colors[0] ? colors[0] : undefined
            });
        } catch (error) {
            console.error("Failed to extract colors", error);
            setGlobalTheme({ logo: logoSrc });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGlobalTheme({
          author: {
            ...currentAuthor,
            avatar: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCustomGradient = (start: string, end: string) => {
    setCustomColors({ start, end });
    setGlobalTheme({ background: `linear-gradient(135deg, ${start}, ${end})` });
  };

  return (
    <div className="flex flex-col gap-6 p-4 border-b border-gray-200 dark:border-gray-800">
      {/* Author Profile Section */}
      <div>
        <label
          htmlFor="author-profile"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2"
        >
          <User size={14} /> Author Profile
        </label>

        <div id="author-profile" className="flex items-start gap-4 mb-3">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentAuthor.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <label
              className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-full cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Upload Avatar"
            >
              <Upload size={12} className="text-gray-600 dark:text-gray-300" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={currentAuthor.name}
              onChange={(e) =>
                setGlobalTheme({
                  author: { ...currentAuthor, name: e.target.value },
                })
              }
              placeholder="Name"
              className="w-full text-sm p-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={currentAuthor.handle}
              onChange={(e) =>
                setGlobalTheme({
                  author: { ...currentAuthor, handle: e.target.value },
                })
              }
              placeholder="Handle"
              className="w-full text-sm p-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAvatarPresets(!showAvatarPresets)}
          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
        >
          {showAvatarPresets ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )}
          {showAvatarPresets ? "Hide Presets" : "Choose from Presets"}
        </button>

        {showAvatarPresets && (
          <div className="grid grid-cols-6 gap-2 mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-48 overflow-y-auto">
            {PRESET_AVATARS.map((src, i) => (
              <button
                type="button"
                key={`${i * 2}`}
                onClick={() =>
                  setGlobalTheme({ author: { ...currentAuthor, avatar: src } })
                }
                className={clsx(
                  "w-full aspect-square rounded-full overflow-hidden border hover:scale-110 transition-transform",
                  currentAuthor.avatar === src
                    ? "ring-2 ring-blue-500 ring-offset-1"
                    : "border-gray-200 dark:border-gray-700",
                )}
                title={`Preset ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />

      <div>
        <label
          htmlFor="platform-selction"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block"
        >
          Platform
        </label>
        <div id="platform-selction" className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                setGlobalTheme({ platform: p.id });
              }}
              className={clsx(
                "p-2 rounded-md transition-colors",
                globalTheme.platform === p.id
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              )}
              title={p.label}
            >
              <p.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="frame-selection"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block"
        >
          Frame Style
        </label>
        <div id="frame-selection" className="flex gap-2 text-sm bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
            {FRAMES.map((f) => (
                <button
                    type="button"
                    key={f.id}
                    onClick={() => setGlobalTheme({ frameStyle: f.id })}
                    className={clsx(
                        "flex-1 py-1 px-2 rounded-md capitalize transition-all cursor-pointer text-xs flex items-center justify-center gap-1",
                        globalTheme.frameStyle === f.id
                            ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    title={f.label}
                >
                    <f.icon size={14} />
                    <span className="hidden sm:inline">{f.label}</span>
                </button>
            ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="appearance-selection"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block"
        >
          Appearance
        </label>
        <div
          id="appearance-selection"
          className="flex gap-2 text-sm bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4"
        >
          {["light", "dark"].map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setGlobalTheme({ mode: mode as any })}
              className={clsx(
                "flex-1 py-1 rounded-md capitalize transition-all cursor-pointer",
                globalTheme.mode === mode
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="show-footer"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider block"
            >
              Show Footer
            </label>
            <button
              id="show-footer"
              type="button"
              onClick={() =>
                setGlobalTheme({ showFooter: !globalTheme.showFooter })
              }
              className={clsx(
                "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                (globalTheme.showFooter ?? true)
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-700",
              )}
            >
              <div
                className={clsx(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  (globalTheme.showFooter ?? true) && "translate-x-4",
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 size={14} className="text-purple-500" />
              <label
                htmlFor="set-auto-split"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider block"
              >
                Auto Split
              </label>
            </div>
            <button
              id="set-auto-split"
              type="button"
              onClick={() =>
                setGlobalTheme({ autoSplit: !globalTheme.autoSplit })
              }
              aria-label="Toggle Auto Split"
              className={clsx(
                "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                globalTheme.autoSplit
                  ? "bg-purple-500"
                  : "bg-gray-300 dark:bg-gray-700",
              )}
            >
              <div
                className={clsx(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  globalTheme.autoSplit && "translate-x-4",
                )}
              />
            </button>
          </div>
        </div>

        <label
          htmlFor="style-selection"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block"
        >
          Card Style
        </label>
        <div
          id="style-selection"
          className="flex gap-2 text-sm bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4"
        >
          {["solid", "glass", "flat"].map((style) => (
            <button
              type="button"
              key={style}
              onClick={() => setGlobalTheme({ cardStyle: style as any })}
              className={clsx(
                "flex-1 py-1 rounded-md capitalize transition-all cursor-pointer text-xs",
                globalTheme.cardStyle === style
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Background Palette */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="background-selection"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider block"
            >
              Background
            </label>
            {globalTheme.background && (
              <button
                type="button"
                onClick={() => setGlobalTheme({ background: undefined })}
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <RefreshCcw size={10} /> Reset
              </button>
            )}
          </div>

          {/* Presets */}
          <div
            id="background-selection"
            className="grid grid-cols-6 gap-2 mb-3"
          >
            {/* Show Brand Colors first if available */}
            {globalTheme.brandColors?.map((color, i) => (
                <button
                    type="button"
                    key={`brand-${i}`}
                    onClick={() => setGlobalTheme({ background: color })}
                    className={clsx(
                        "w-full aspect-square rounded-full border hover:scale-110 transition-transform",
                        globalTheme.background === color
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : "border-gray-200",
                    )}
                    style={{ background: color }}
                    aria-label={`Brand Color ${i + 1}`}
                    title="Brand Color"
                />
            ))}

            {PRESET_GRADIENTS.map((bg, i) => (
              <button
                type="button"
                key={`${i * 2}`}
                onClick={() => setGlobalTheme({ background: bg })}
                className={clsx(
                  "w-full aspect-square rounded-full border hover:scale-110 transition-transform",
                  globalTheme.background === bg
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "border-gray-200",
                )}
                style={{ background: bg }}
                aria-label={`Preset ${i + 1}`}
              />
            ))}
          </div>

          {/* Custom Builder */}
          <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
            <Palette size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Custom</span>
            <input
              type="color"
              value={customColors.start}
              onChange={(e) =>
                applyCustomGradient(e.target.value, customColors.end)
              }
              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              title="Start Color"
            />
            <input
              type="color"
              value={customColors.end}
              onChange={(e) =>
                applyCustomGradient(customColors.start, e.target.value)
              }
              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              title="End Color"
            />
          </div>
        </div>

        <label
          htmlFor="brand-logo"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block"
        >
          Brand Logo
        </label>
        {globalTheme.logo ? (
          <div
            id="brand-logo"
            className="relative w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={globalTheme.logo}
              alt="Brand Logo"
              className="max-w-full max-h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setGlobalTheme({ logo: undefined, brandColors: [] })}
              className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md hover:bg-red-600 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label
            id="brand-logo"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer border border-dashed border-gray-300 rounded-md p-2 justify-center hover:bg-gray-50"
          >
            <Upload size={16} /> Upload Logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
        )}
      </div>
    </div>
  );
}
