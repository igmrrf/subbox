import clsx from "clsx";
import {
  Instagram,
  LayoutTemplate,
  Linkedin,
  Maximize,
  Minimize,
  Monitor,
  Palette,
  Smartphone,
  Twitter,
  Upload,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { PRESET_AVATARS } from "@/constants/avatars";
import { Author, type SlideFrame, useDeckStore } from "@/store/deck-store";
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

        try {
          const colors = await extractColors(logoSrc);
          setGlobalTheme({
            logo: logoSrc,
            brandColors: colors,
            background:
              colors.length >= 2
                ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
                : colors[0]
                  ? colors[0]
                  : undefined,
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

  const SectionLabel = ({
    label,
    icon: Icon,
  }: {
    label: string;
    icon?: any;
  }) => (
    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
      {Icon && <Icon size={12} />} {label}
    </div>
  );

  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {/* Author Profile Section */}
      <div className="p-6">
        <SectionLabel label="Identity" icon={User} />

        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative ring-offset-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-2 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentAuthor.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <label
              className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 rounded-full cursor-pointer shadow-sm hover:scale-110 transition-transform"
              title="Upload Avatar"
            >
              <Upload size={10} className="text-gray-600 dark:text-gray-300" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <div className="flex-1 space-y-1.5">
            <input
              type="text"
              value={currentAuthor.name}
              onChange={(e) =>
                setGlobalTheme({
                  author: { ...currentAuthor, name: e.target.value },
                })
              }
              placeholder="Name"
              className="w-full text-xs font-semibold p-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent focus:border-gray-900 dark:focus:border-white outline-none transition-colors"
            />
            <input
              type="text"
              value={currentAuthor.handle}
              onChange={(e) =>
                setGlobalTheme({
                  author: { ...currentAuthor, handle: e.target.value },
                })
              }
              placeholder="@handle"
              className="w-full text-[11px] p-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent focus:border-gray-900 dark:focus:border-white outline-none text-gray-500 font-mono transition-colors"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAvatarPresets(!showAvatarPresets)}
          className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
        >
          {showAvatarPresets ? <Minimize size={10} /> : <Maximize size={10} />}
          {showAvatarPresets ? "Close Presets" : "Library"}
        </button>

        {showAvatarPresets && (
          <div className="grid grid-cols-5 gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl max-h-40 overflow-y-auto">
            {PRESET_AVATARS.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() =>
                  setGlobalTheme({ author: { ...currentAuthor, avatar: src } })
                }
                className={clsx(
                  "w-full aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-110",
                  currentAuthor.avatar === src
                    ? "border-blue-500 scale-110"
                    : "border-transparent",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Global Config Section */}
      <div className="p-6 space-y-8">
        <div>
          <SectionLabel label="Platform" />
          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setGlobalTheme({ platform: p.id })}
                className={clsx(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 group",
                  globalTheme.platform === p.id
                    ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 shadow-md"
                    : "border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
                )}
                title={p.label}
              >
                <p.icon size={18} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel label="Frame" />
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            {FRAMES.map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => setGlobalTheme({ frameStyle: f.id })}
                className={clsx(
                  "flex-1 py-2 rounded-lg transition-all flex flex-col items-center gap-1",
                  globalTheme.frameStyle === f.id
                    ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100 font-bold"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400",
                )}
              >
                <f.icon size={14} />
                <span className="text-[10px] uppercase tracking-tighter">
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel label="Environment" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-[10px] text-gray-400 font-bold uppercase">
                Mode
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                {["light", "dark"].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setGlobalTheme({ mode: mode as any })}
                    className={clsx(
                      "flex-1 py-1.5 rounded-md capitalize transition-all text-[11px] font-medium",
                      globalTheme.mode === mode
                        ? "bg-white dark:bg-gray-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] text-gray-400 font-bold uppercase">
                Card
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                {["solid", "glass", "flat"].map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setGlobalTheme({ cardStyle: style as any })}
                    className={clsx(
                      "flex-1 py-1.5 rounded-md capitalize transition-all text-[11px] font-medium",
                      globalTheme.cardStyle === style
                        ? "bg-white dark:bg-gray-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Show Footer
              </div>
              <span className="text-[10px] text-gray-400">
                Timestamp and stats visibility
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setGlobalTheme({ showFooter: !globalTheme.showFooter })
              }
              className={clsx(
                "w-10 h-5 rounded-full transition-all relative",
                globalTheme.showFooter
                  ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  : "bg-gray-200 dark:bg-gray-800",
              )}
            >
              <div
                className={clsx(
                  "absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform",
                  globalTheme.showFooter && "translate-x-5",
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Auto Split
              </div>
              <span className="text-[10px] text-gray-400">
                Handle long text automatically
              </span>
            </div>
            <button
              type="button"
              aria-label="Toggle Auto Split"
              onClick={() =>
                setGlobalTheme({ autoSplit: !globalTheme.autoSplit })
              }
              className={clsx(
                "w-10 h-5 rounded-full transition-all relative",
                globalTheme.autoSplit
                  ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "bg-gray-200 dark:bg-gray-800",
              )}
            >
              <div
                className={clsx(
                  "absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform",
                  globalTheme.autoSplit && "translate-x-5",
                )}
              />
            </button>
          </div>
        </div>

        <div>
          <SectionLabel label="Background" />
          <div className="grid grid-cols-6 gap-2 mb-4">
            {globalTheme.brandColors?.map((color, i) => (
              <button
                type="button"
                key={`brand-${i}`}
                onClick={() => setGlobalTheme({ background: color })}
                className={clsx(
                  "w-full aspect-square rounded-lg border-2 transition-transform hover:scale-110",
                  globalTheme.background === color
                    ? "border-blue-500 scale-110"
                    : "border-transparent",
                )}
                style={{ background: color }}
                title="Brand Color"
              />
            ))}
            {PRESET_GRADIENTS.map((bg, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setGlobalTheme({ background: bg })}
                className={clsx(
                  "w-full aspect-square rounded-lg border-2 transition-transform hover:scale-110",
                  globalTheme.background === bg
                    ? "border-blue-500 scale-110"
                    : "border-transparent",
                )}
                style={{ background: bg }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <Palette size={14} className="text-gray-400" />
            <div className="flex-1 flex gap-2">
              <input
                type="color"
                value={customColors.start}
                onChange={(e) =>
                  applyCustomGradient(e.target.value, customColors.end)
                }
                className="w-full h-6 rounded cursor-pointer border-none bg-transparent"
              />
              <input
                type="color"
                value={customColors.end}
                onChange={(e) =>
                  applyCustomGradient(customColors.start, e.target.value)
                }
                className="w-full h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <SectionLabel label="Brand Asset" />
          {globalTheme.logo ? (
            <div className="relative group w-20 h-20 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={globalTheme.logo}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
              <button
                type="button"
                onClick={() =>
                  setGlobalTheme({ logo: undefined, brandColors: [] })
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <Upload size={20} />
              <span className="font-bold uppercase tracking-tighter">
                Upload Logo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                data-testid="logo-upload"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
