"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { useDeckStore } from "@/store/deck-store";
import { SlideCard } from "./SlideCard";

export function Editor() {
  const { slides } = useDeckStore();
  const [deckWidth, setDeckWidth] = useState(800);

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
          <Maximize2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          No slides yet
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Add your first slide from the left sidebar to start creating.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-12 pb-32">
      {/* Deck Controls */}
      <div className="sticky top-0 z-20 w-full hidden md:flex justify-center pb-4 pointer-events-none">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full shadow-xl flex items-center gap-4 pointer-events-auto">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
            Width
          </span>
          <input
            type="range"
            min="400"
            max="1200"
            value={deckWidth}
            onChange={(e) => setDeckWidth(parseInt(e.target.value, 10))}
            className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-white"
          />
          <span className="text-[10px] font-mono text-gray-500 w-8">
            {deckWidth}px
          </span>
        </div>
      </div>

      <motion.div
        style={{ width: "100%", maxWidth: deckWidth }}
        className="flex flex-col gap-12 transition-all duration-300 ease-in-out"
      >
        <AnimatePresence mode="popLayout">
          {slides.map((slide, index) => (
            <SlideCard key={slide.id} slide={slide} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
