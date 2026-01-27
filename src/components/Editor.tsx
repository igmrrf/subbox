"use client";

import { AnimatePresence } from "framer-motion";
import { useDeckStore } from "@/store/deck-store";
import { SlideCard } from "./SlideCard";

export function Editor() {
  const { slides } = useDeckStore();

  if (slides.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No slides. Add one from the sidebar.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-20">
      <AnimatePresence>
        {slides.map((slide, index) => (
          <SlideCard key={slide.id} slide={slide} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}

