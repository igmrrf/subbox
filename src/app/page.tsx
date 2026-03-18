"use client";

import clsx from "clsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { DownloadCloud, Menu, Plus, Trash2, X, Palette } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Editor } from "@/components/Editor";
import { SortableSlideList } from "@/components/SortableSlideList";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useDeckStore } from "@/store/deck-store";
import { generateImage } from "@/utils/generateImage";
import { clearAllBrowserData } from "@/utils/storage";

export default function Home() {
  const { slides, addSlide, globalTheme, reset } = useDeckStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

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

  useLayoutEffect(() => {
    (async () => {
      if (!localStorage.getItem("cleared")) {
        await clearAllBrowserData();
        localStorage.setItem("cleared", "cleared");
      }
    })();
  });

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset everything? This will clear all slides and settings.",
      )
    ) {
      reset();
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-30 shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsLeftSidebarOpen(!isLeftSidebarOpen);
            setIsRightSidebarOpen(false);
          }}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Subbox</h1>
        <button
          type="button"
          onClick={() => {
            setIsRightSidebarOpen(!isRightSidebarOpen);
            setIsLeftSidebarOpen(false);
          }}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          <Palette size={20} />
        </button>
      </header>

      {/* Left Sidebar - Slide Management */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-black transition-transform duration-300 ease-in-out transform md:static md:translate-x-0",
          isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold tracking-tight">Subbox</h1>
          <button
            type="button"
            className="md:hidden"
            onClick={() => setIsLeftSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                addSlide();
                if (window.innerWidth < 768) setIsLeftSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer text-sm shadow-sm"
            >
              <Plus size={16} /> Add Slide
            </button>

            <button
              type="button"
              onClick={handleExportAll}
              disabled={isExporting || slides.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 text-sm border border-gray-200 dark:border-gray-700"
            >
              <DownloadCloud size={16} />{" "}
              {isExporting ? "Exporting..." : "Export Deck"}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Deck Outline
              </h3>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                {slides.length}
              </span>
            </div>
            <SortableSlideList />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 w-full text-gray-400 hover:text-red-500 px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs font-medium"
            >
              <Trash2 size={14} /> Clear All Data
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#fcfcfc] dark:bg-gray-950 p-4 md:p-12">
        <div className="max-w-4xl mx-auto">
          <Editor />
        </div>
      </main>

      {/* Right Sidebar - Global Config */}
      <aside
        className={clsx(
          "fixed inset-y-0 right-0 z-40 w-80 border-l border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-black transition-transform duration-300 ease-in-out transform md:static md:translate-x-0",
          isRightSidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold tracking-tight uppercase">
            Customization
          </h3>
          <button
            type="button"
            className="md:hidden"
            onClick={() => setIsRightSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <ThemeSelector />
        </div>
      </aside>

      {/* Overlay for mobile sidebars */}
      {(isLeftSidebarOpen || isRightSidebarOpen) && (
        <button
          type="button"
          aria-label="Close sidebars"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity border-none outline-none"
          onClick={() => {
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}
