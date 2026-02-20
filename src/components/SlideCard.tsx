"use client";

import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import {
  ClipboardCopy,
  Copy,
  Download,
  Heart,
  Link2,
  MessageCircle,
  RefreshCw,
  Repeat2,
  Trash2,
  Layout,
  Code,
  FileText,
  Smartphone,
  Columns,
  Square,
  Layers
} from "lucide-react";
import { type ClipboardEvent, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { type Slide, type SlideType, type SlideLayout, useDeckStore, type Annotation } from "@/store/deck-store";
import { generateImage } from "@/utils/generateImage";
import { PLATFORM_LIMITS, splitTextContent } from "@/utils/textUtils";
import { detectInputType } from "@/utils/inputDetector";
import { SlidePreview } from "./SlidePreview";
import { SmartPasteModal } from "./SmartPasteModal";
import clsx from "clsx";

interface SlideCardProps {
  slide: Slide;
  index: number;
}

export function SlideCard({ slide, index }: SlideCardProps) {
  const {
    updateSlide,
    removeSlide,
    duplicateSlide,
    globalTheme,
    setSlides,
    setSourceText,
  } = useDeckStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedContent, setPastedContent] = useState("");
  const [isUnfurling, setIsUnfurling] = useState(false);

  const randomizeStats = () => {
    updateSlide(slide.id, {
      stats: {
        likes: Math.floor(Math.random() * (50000 - 100 + 1)) + 100,
        replies: Math.floor(Math.random() * 5000),
        shares: Math.floor(Math.random() * 10000),
      },
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage(slide, globalTheme);
      saveAs(blob, `slide-${index + 1}.png`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage(slide, globalTheme);
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (e) {
      console.error(e);
      alert("Failed to copy image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnfurl = async () => {
    const url = prompt("Enter URL to fetch metadata from:");
    if (!url) return;

    setIsUnfurling(true);
    try {
      const res = await fetch("/api/unfurl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const updates: Partial<Slide> = {
        content: { ...slide.content, primary: data.text || slide.content.primary },
      };

      if (data.author && (data.author.name || data.author.handle)) {
        updates.author = {
          name: data.author.name || slide.author.name,
          handle: data.author.handle || slide.author.handle,
          avatar: data.author.avatar || slide.author.avatar,
        };
      }

      if (data.stats) {
        updates.stats = {
          likes: data.stats.likes ?? slide.stats.likes,
          replies: data.stats.replies ?? slide.stats.replies,
          shares: data.stats.shares ?? slide.stats.shares,
        };
      }

      updateSlide(slide.id, updates);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch URL metadata");
    } finally {
      setIsUnfurling(false);
    }
  };

  const handleUpdateContent = (primary: string, secondary?: string) => {
      updateSlide(slide.id, { content: { primary, secondary } });
  };

  const handleAddAnnotation = (annotation: Annotation) => {
      updateSlide(slide.id, {
          annotations: [...(slide.annotations || []), annotation]
      });
  };

  const handleRemoveAnnotation = (annotationId: string) => {
      updateSlide(slide.id, {
          annotations: (slide.annotations || []).filter(a => a.id !== annotationId)
      });
  };

  const handleConfirmSplit = () => {
    setSourceText(pastedContent);
    const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
    const chunks = splitTextContent(pastedContent, limit);

    const newSlides: Slide[] = chunks.map((content) => ({
      id: uuidv4(),
      type: 'social',
      layout: 'single',
      content: { primary: content },
      settings: {
          frame: 'macos',
          theme: globalTheme.platform,
          padding: 32
      },
      author: slide.author,
      stats: { ...slide.stats }, 
      date: slide.date,
      annotations: []
    }));

    setSlides(newSlides);
    setShowPasteModal(false);
    setPastedContent("");
  };

  const handleCancelSplit = () => {
    updateSlide(slide.id, { content: { ...slide.content, primary: slide.content.primary + pastedContent } });
    setSourceText("");
    setShowPasteModal(false);
    setPastedContent("");
  };

  const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
  const charCount = slide.content.primary?.length || 0;
  const isOverLimit = charCount > limit;

  // Type Toggle Helpers
  const TYPES: { id: SlideType; icon: any; label: string }[] = [
      { id: "social", icon: Smartphone, label: "Social" },
      { id: "code", icon: Code, label: "Code" },
      { id: "diff", icon: Columns, label: "Diff" },
      { id: "text", icon: FileText, label: "Text" },
  ];

  // Layout Toggle Helpers
  const LAYOUTS: { id: SlideLayout; icon: any; label: string }[] = [
      { id: "single", icon: Square, label: "Single" },
      { id: "split", icon: Columns, label: "Split" },
      { id: "stack", icon: Layers, label: "Stack" },
  ];

  return (
    <>
      <SmartPasteModal
        isOpen={showPasteModal}
        onClose={handleCancelSplit}
        onConfirm={handleConfirmSplit}
        slideCount={splitTextContent(pastedContent, limit).length}
      />
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-500">Slide {index + 1}</span>
              
              {/* Type Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
                  {TYPES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateSlide(slide.id, { type: t.id })}
                        className={clsx(
                            "p-1.5 rounded text-xs flex items-center gap-1 transition-all",
                            slide.type === t.id 
                                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" 
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                        title={t.label}
                      >
                          <t.icon size={14} />
                      </button>
                  ))}
              </div>

              {/* Layout Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
                  {LAYOUTS.map(l => (
                      <button
                        key={l.id}
                        onClick={() => updateSlide(slide.id, { layout: l.id })}
                        className={clsx(
                            "p-1.5 rounded text-xs flex items-center gap-1 transition-all",
                            slide.layout === l.id 
                                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" 
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                        title={l.label}
                      >
                          <l.icon size={14} />
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUnfurl}
              disabled={isUnfurling}
              className="text-gray-500 hover:text-purple-500 p-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded cursor-pointer disabled:opacity-50"
              title="Import from URL"
            >
              <Link2 size={16} />
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="text-gray-500 hover:text-green-500 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded cursor-pointer disabled:opacity-50"
              title="Copy Image to Clipboard"
            >
              <ClipboardCopy size={16} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="text-gray-500 hover:text-green-500 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded cursor-pointer disabled:opacity-50"
              title="Download Image"
            >
              <Download size={16} />
            </button>

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />

            <button
              type="button"
              onClick={() => duplicateSlide(slide.id)}
              className="text-gray-500 hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded cursor-pointer"
              title="Duplicate slide"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              onClick={() => removeSlide(slide.id)}
              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
              title="Delete slide"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <SlidePreview
              content={slide.content}
              theme={slide.settings?.theme || globalTheme.platform}
              type={slide.type}
              language={slide.settings?.language}
              layout={slide.layout}
              author={slide.author}
              stats={slide.stats}
              date={slide.date}
              annotations={slide.annotations}
              onUpdateContent={handleUpdateContent}
              onAddAnnotation={handleAddAnnotation}
              onRemoveAnnotation={handleRemoveAnnotation}
            />
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
           <div className={`text-xs ${isOverLimit ? "text-red-500 font-bold" : "text-gray-400"}`}>
              {charCount} / {limit}
           </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1.5 text-gray-400"
              title="Replies"
            >
              <MessageCircle size={14} />
              <input
                type="number"
                value={slide.stats.replies}
                onChange={(e) =>
                  updateSlide(slide.id, {
                    stats: {
                      ...slide.stats,
                      replies: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-16 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none text-center text-sm"
              />
            </div>
            <div
              className="flex items-center gap-1.5 text-gray-400"
              title="Shares"
            >
              <Repeat2 size={14} />
              <input
                type="number"
                value={slide.stats.shares}
                onChange={(e) =>
                  updateSlide(slide.id, {
                    stats: {
                      ...slide.stats,
                      shares: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-16 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none text-center text-sm"
              />
            </div>
            <div
              className="flex items-center gap-1.5 text-gray-400"
              title="Likes"
            >
              <Heart size={14} />
              <input
                type="number"
                value={slide.stats.likes}
                onChange={(e) =>
                  updateSlide(slide.id, {
                    stats: {
                      ...slide.stats,
                      likes: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-16 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none text-center text-sm"
              />
            </div>
            <button
              type="button"
              onClick={randomizeStats}
              className="ml-2 text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Randomize Stats"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
