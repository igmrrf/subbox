'use client';

import React from 'react';
import { useDeckStore } from '@/store/deck-store';
import clsx from 'clsx';
import { Twitter, Linkedin, Instagram, Smartphone } from 'lucide-react';

const PLATFORM_STYLES = {
  twitter: { 
      aspectRatio: '16/9', 
      backgroundClass: 'bg-gradient-to-br from-blue-400 to-cyan-300',
      Icon: Twitter,
      iconColor: 'text-blue-400'
  },
  linkedin: { 
      aspectRatio: '4/5', 
      backgroundClass: 'bg-gradient-to-br from-blue-700 to-blue-900',
      Icon: Linkedin,
      iconColor: 'text-blue-700'
  },
  instagram: { 
      aspectRatio: '1/1', 
      backgroundClass: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
      Icon: Instagram,
      iconColor: 'text-pink-500'
  },
  tiktok: { 
      aspectRatio: '9/16', 
      backgroundClass: 'bg-black',
      Icon: Smartphone,
      iconColor: 'text-black'
  },
} as const;

export function SlidePreview({ content }: { content: string, theme?: string }) {
    const { globalTheme } = useDeckStore();
    const style = PLATFORM_STYLES[globalTheme.platform] || PLATFORM_STYLES.twitter;
    const isDark = globalTheme.mode === 'dark';

    // Card styling
    let cardBgClass = isDark ? "bg-gray-900/90 text-white" : "bg-white/90 text-gray-900";
    let cardBorderClass = isDark ? "border-gray-700" : "border-gray-200";
    let shadowClass = "shadow-2xl";
    let backdropClass = "";

    if (globalTheme.cardStyle === 'glass') {
        cardBgClass = isDark ? "bg-gray-900/60 text-white" : "bg-white/60 text-gray-900";
        backdropClass = "backdrop-blur-xl";
    } else if (globalTheme.cardStyle === 'flat') {
        shadowClass = "shadow-none";
        cardBgClass = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900";
    }

    // Chrome dots colors
    const dotColors = {
        red: "bg-[#FF5F56]",
        yellow: "bg-[#FFBD2E]",
        green: "bg-[#27C93F]"
    };

    // Adaptive Font Sizing Logic
    const textLength = content?.length || 0;
    let sizeClass = '';
    
    if (globalTheme.fontSize === 'huge') {
        if (textLength > 100) sizeClass = 'text-2xl'; 
        else if (textLength > 200) sizeClass = 'text-xl';
        else sizeClass = 'text-3xl';
    } else if (globalTheme.fontSize === 'large') {
        if (textLength > 150) sizeClass = 'text-lg'; 
        else if (textLength > 250) sizeClass = 'text-base';
        else sizeClass = 'text-xl';
    } else { // medium
        if (textLength > 200) sizeClass = 'text-sm';
        else sizeClass = 'text-base';
    }

    return (
        <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
            <div
                style={{ 
                    aspectRatio: style.aspectRatio,
                    background: globalTheme.background || undefined
                }}
                className={clsx(
                    "w-full max-w-[500px] flex items-center justify-center p-8 md:p-12 relative overflow-hidden transition-all duration-300",
                    !globalTheme.background && style.backgroundClass // Only apply default class if no custom bg
                )}
            >
                <div className={clsx(
                    "w-full max-w-full rounded-xl overflow-hidden flex flex-col transition-all duration-300",
                    cardBgClass,
                    shadowClass,
                    backdropClass,
                    globalTheme.cardStyle !== 'flat' && "border",
                    cardBorderClass
                )}>
                    {globalTheme.windowChrome && (
                        <div className={clsx(
                            "h-12 w-full flex items-center justify-between px-4 border-b",
                             isDark ? "border-white/10" : "border-black/5"
                        )}>
                            <div className="flex gap-2">
                                <div className={clsx("w-3 h-3 rounded-full shadow-sm", dotColors.red)} />
                                <div className={clsx("w-3 h-3 rounded-full shadow-sm", dotColors.yellow)} />
                                <div className={clsx("w-3 h-3 rounded-full shadow-sm", dotColors.green)} />
                            </div>
                            <div className="opacity-70">
                                <style.Icon size={24} />
                            </div>
                        </div>
                    )}

                    <div className="p-8 md:p-10 flex-1 flex flex-col relative">
                        <div className={clsx(
                            "font-medium whitespace-pre-wrap leading-relaxed",
                            sizeClass
                         )}>
                            {content || "Start typing..."}
                        </div>

                        {globalTheme.logo && (
                             <div className="mt-6 flex justify-end">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img 
                                    src={globalTheme.logo} 
                                    alt="User Logo" 
                                    className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10"
                                 />
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
