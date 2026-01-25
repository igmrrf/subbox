import { useDeckStore } from '@/store/deck-store';
import { Monitor, Smartphone, Instagram, Linkedin, Twitter, Upload, X, Layout, Layers, Wand2, Palette, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Smartphone },
] as const;

const PRESET_GRADIENTS = [
    'linear-gradient(to bottom right, #f472b6, #d8b4fe, #818cf8)', // Sunset
    'linear-gradient(to bottom right, #2dd4bf, #3b82f6, #6366f1)', // Ocean
    'linear-gradient(to bottom right, #fbbf24, #f87171, #ef4444)', // Heat
    'linear-gradient(to bottom right, #34d399, #10b981, #059669)', // Forest
    'linear-gradient(to bottom right, #1f2937, #111827, #000000)', // Dark
    'linear-gradient(to bottom right, #ffffff, #f3f4f6, #e5e7eb)', // Light
];

export function ThemeSelector() {
  const { globalTheme, setGlobalTheme } = useDeckStore();
  const [customColors, setCustomColors] = useState({ start: '#3b82f6', end: '#9333ea' });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setGlobalTheme({ logo: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const applyCustomGradient = (start: string, end: string) => {
      setCustomColors({ start, end });
      setGlobalTheme({ background: `linear-gradient(135deg, ${start}, ${end})` });
  };

  return (
    <div className="flex flex-col gap-6 p-4 border-b border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[calc(100vh-100px)]">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Platform</label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                  setGlobalTheme({ platform: p.id, background: undefined }); // Reset bg on platform switch? Or keep? 
                  // Usually user expects platform theme defaults unless explicit override.
                  // Let's keep override if it was explicitly set, but here maybe we want to allow "resetting" easily.
                  // For now, let's NOT reset background automatically to allow "applying twitter layout to my custom purple bg".
                  setGlobalTheme({ platform: p.id });
              }}
              className={clsx(
                "p-2 rounded-md transition-colors",
                globalTheme.platform === p.id
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
              title={p.label}
            >
              <p.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Appearance</label>
           <div className="flex gap-2 text-sm bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
              {['light', 'dark'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGlobalTheme({ mode: mode as any })}
                    className={clsx(
                        "flex-1 py-1 rounded-md capitalize transition-all cursor-pointer",
                         globalTheme.mode === mode
                         ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                         : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                      {mode}
                  </button>
              ))}
           </div>
           
           {/* Toggles */}
           <div className="space-y-3 mb-4">
               <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Window Chrome</label>
                   <button
                      onClick={() => setGlobalTheme({ windowChrome: !globalTheme.windowChrome })}
                      className={clsx(
                          "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                          globalTheme.windowChrome ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                      )}
                   >
                       <div className={clsx(
                           "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                           globalTheme.windowChrome && "translate-x-4"
                       )} />
                   </button>
               </div>

               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Wand2 size={14} className="text-purple-500" />
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Auto Split</label>
                   </div>
                   <button
                      onClick={() => setGlobalTheme({ autoSplit: !globalTheme.autoSplit })}
                      aria-label="Toggle Auto Split"
                      className={clsx(
                          "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                          globalTheme.autoSplit ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-700"
                      )}
                   >
                       <div className={clsx(
                           "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                           globalTheme.autoSplit && "translate-x-4"
                       )} />
                   </button>
               </div>
           </div>
           
           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Card Style</label>
           <div className="flex gap-2 text-sm bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
              {['solid', 'glass', 'flat'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setGlobalTheme({ cardStyle: style as any })}
                    className={clsx(
                        "flex-1 py-1 rounded-md capitalize transition-all cursor-pointer text-xs",
                         globalTheme.cardStyle === style
                         ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                         : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                      {style}
                  </button>
              ))}
           </div>

           {/* Background Palette */}
           <div className="mb-4">
               <div className="flex items-center justify-between mb-2">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Background</label>
                   {globalTheme.background && (
                       <button 
                           onClick={() => setGlobalTheme({ background: undefined })}
                           className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                       >
                           <RefreshCcw size={10} /> Reset
                       </button>
                   )}
               </div>
               
               {/* Presets */}
               <div className="grid grid-cols-6 gap-2 mb-3">
                   {PRESET_GRADIENTS.map((bg, i) => (
                       <button
                           key={i}
                           onClick={() => setGlobalTheme({ background: bg })}
                           className={clsx(
                               "w-full aspect-square rounded-full border hover:scale-110 transition-transform",
                               globalTheme.background === bg ? "ring-2 ring-blue-500 ring-offset-2" : "border-gray-200"
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
                       onChange={(e) => applyCustomGradient(e.target.value, customColors.end)}
                       className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                       title="Start Color"
                   />
                   <input 
                       type="color" 
                       value={customColors.end}
                       onChange={(e) => applyCustomGradient(customColors.start, e.target.value)}
                       className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                       title="End Color"
                   />
               </div>
           </div>

           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Brand Logo</label>
           {globalTheme.logo ? (
               <div className="relative w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={globalTheme.logo} alt="Brand Logo" className="max-w-full max-h-full object-contain" />
                   <button 
                        onClick={() => setGlobalTheme({ logo: undefined })}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md hover:bg-red-600 cursor-pointer"
                   >
                       <X size={12} />
                   </button>
               </div>
           ) : (
               <label className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer border border-dashed border-gray-300 rounded-md p-2 justify-center hover:bg-gray-50">
                   <Upload size={16} /> Upload Logo
                   <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
               </label>
           )}
      </div>
    </div>
  );
}