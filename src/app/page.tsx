"use client";

import clsx from "clsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { DownloadCloud, Menu, Plus, X } from "lucide-react";
import { useState } from "react";
import { Editor } from "@/components/Editor";
import { SortableSlideList } from "@/components/SortableSlideList";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useDeckStore } from "@/store/deck-store";
import { generateImage } from "@/utils/generateImage";

export default function Home() {
  const { slides, addSlide, globalTheme } = useDeckStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleExportAll = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const imgFolder = zip.folder("images");

      await Promise.all(
        slides.map(async (slide, i) => {
          const blob = await generateImage(slide, globalTheme);
          imgFolder?.file(`slide-${i + 1}.png`, blob);
        }),
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "subbox-deck.zip");
    } catch (e) {
      console.error(e);
      alert("Failed to export deck");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-20 shrink-0">
        <h1 className="text-xl font-bold">Subbox</h1>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Controls */}
      <aside
        className={clsx(
          "fixed inset-0 z-10 md:static md:z-0 w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-black transition-transform duration-300 ease-in-out transform",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          // On mobile, top padding for header? No, fixed inset-0 covers it if z-index high.
          // But header is z-20. So sidebar slides UNDER header?
          // If Sidebar is z-10 and top-0, it covers screen. Header z-20 is on top.
          // We need padding-top on mobile sidebar to avoid hiding behind header?
          // Or just make sidebar `top-[57px]` (header height).
          // Let's use top-14 (approx 56px) for mobile.
          "top-[60px] md:top-0 h-[calc(100%-60px)] md:h-full",
        )}
      >
        <div className="hidden md:block p-4 shrink-0">
          <h1 className="text-xl font-bold">Subbox</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <ThemeSelector />

          <div className="p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  addSlide();
                  if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add Slide
              </button>

              <button
                type="button"
                onClick={handleExportAll}
                disabled={isExporting || slides.length === 0}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud size={16} /> {isExporting ? "..." : "Export"}
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Slides
              </h3>
              <SortableSlideList />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative w-full h-full">
        <Editor />
      </main>

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
