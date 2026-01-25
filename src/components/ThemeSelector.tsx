import { useDeckStore } from '@/store/deck-store';
import { Monitor, Smartphone, Instagram, Linkedin, Twitter, Upload, X, Layout, Layers, Wand2 } from 'lucide-react';
import clsx from 'clsx';

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Smartphone },
] as const;

export function ThemeSelector() {
  const { globalTheme, setGlobalTheme } = useDeckStore();

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

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[400px]">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Platform</label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setGlobalTheme({ platform: p.id })}
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
           
           <div className="flex items-center justify-between mb-4">
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

           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                   <Wand2 size={14} className="text-purple-500" />
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Auto Split</label>
               </div>
               <button
                  onClick={() => setGlobalTheme({ autoSplit: !globalTheme.autoSplit })}
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