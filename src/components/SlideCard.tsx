"use client";

import clsx from "clsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import {
  ClipboardCopy,
  Code,
  Copy,
  Download,
  FileText,
  Heart,
  Link2,
  MessageCircle,
  Repeat2,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type Annotation,
  type Slide,
  type SlideType,
  useDeckStore,
} from "@/store/deck-store";
import { generateImage } from "@/utils/generateImage";
import { PLATFORM_LIMITS, splitTextContent } from "@/utils/textUtils";
import { SlidePreview } from "./SlidePreview";
import { SmartPasteModal } from "./SmartPasteModal";

interface SlideCardProps {
  slide: Slide;
  index: number;
}

export function SlideCard({ slide, index }: SlideCardProps) {
  const {
    updateSlide,
    updateAnnotation,
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
        content: {
          ...slide.content,
          primary: data.text || slide.content.primary,
        },
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

      if (data.platform) {
        updates.settings = { ...slide.settings, theme: data.platform };
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
      annotations: [...(slide.annotations || []), annotation],
    });
  };

  const handleRemoveAnnotation = (annotationId: string) => {
    updateSlide(slide.id, {
      annotations: (slide.annotations || []).filter(
        (a) => a.id !== annotationId,
      ),
    });
  };

  const handlePaste = (text: string) => {
    const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
    if (text.length > limit || (text.match(/\n/g) || []).length > 2) {
      setPastedContent(text);
      setShowPasteModal(true);
    } else {
      updateSlide(slide.id, {
        content: { ...slide.content, primary: slide.content.primary + text },
      });
    }
  };

  const handleConfirmSplit = () => {
    setSourceText(pastedContent);
    const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
    const chunks = splitTextContent(pastedContent, limit);

    const newSlides: Slide[] = chunks.map((content) => ({
      id: uuidv4(),
      type: "social",
      layout: "single",
      content: { primary: content },
      settings: {
        frame: globalTheme.frameStyle || "macos",
        theme: globalTheme.platform,
        padding: 32,
      },
      author: globalTheme.author || slide.author,
      stats: { ...slide.stats },
      date: slide.date,
      annotations: [],
    }));

    setSlides(newSlides);
    setShowPasteModal(false);
    setPastedContent("");
  };

  const handleCancelSplit = () => {
    updateSlide(slide.id, {
      content: {
        ...slide.content,
        primary: slide.content.primary + pastedContent,
      },
    });
    setSourceText("");
    setShowPasteModal(false);
    setPastedContent("");
  };

  const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
  const charCount = slide.content.primary?.length || 0;
  const isOverLimit = charCount > limit;

  const TYPES: { id: SlideType; icon: any; label: string }[] = [
    { id: "social", icon: Smartphone, label: "Social" },
    { id: "code", icon: Code, label: "Code" },
    { id: "text", icon: FileText, label: "Text" },
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-black p-1 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="p-6">
          <div className="flex justify-between items-center gap-2 md:gap-4 mb-3 md:mb-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-mono text-gray-300">
                  ID: {slide.id.slice(0, 8)}
                </span>
              </div>

              <div className="hidden md:block h-8 w-px bg-gray-100 dark:bg-gray-800 mx-2" />

              {/* Type Switcher */}
              <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-0.5 md:p-1 border border-gray-100 dark:border-gray-800">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => updateSlide(slide.id, { type: t.id })}
                    className={clsx(
                      "p-1.5 md:p-2 rounded-lg transition-all",
                      slide.type === t.id
                        ? "bg-white dark:bg-gray-800 shadow-sm text-blue-500"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                    )}
                    title={t.label}
                  >
                    <t.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1 md:gap-2">
              <button
                type="button"
                onClick={handleUnfurl}
                disabled={isUnfurling}
                className="text-gray-400 hover:text-purple-500 p-1.5 md:p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all disabled:opacity-50"
                title="Import from URL"
              >
                <Link2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>

              <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-0.5 md:p-1 border border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isGenerating}
                  className="text-gray-400 hover:text-green-500 p-1.5 md:p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50"
                  title="Copy Image"
                >
                  <ClipboardCopy className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="text-gray-400 hover:text-green-500 p-1.5 md:p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-100 dark:bg-gray-800 mx-1 self-center" />

              <button
                type="button"
                onClick={() => duplicateSlide(slide.id)}
                className="text-gray-400 hover:text-blue-500 p-1.5 md:p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                title="Duplicate"
              >
                <Copy className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => removeSlide(slide.id)}
                className="text-gray-400 hover:text-red-500 p-1.5 md:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-[1.5rem] overflow-hidden bg-gray-50/50 dark:bg-gray-900/20">
            <SlidePreview
              slideId={slide.id}
              content={slide.content}
              theme={slide.settings?.theme || globalTheme.platform}
              type={slide.type}
              language={slide.settings?.language}
              author={slide.author}
              stats={slide.stats}
              date={slide.date}
              annotations={slide.annotations}
              onUpdateContent={handleUpdateContent}
              onUpdateAnnotation={(annId, updates) =>
                updateAnnotation(slide.id, annId, updates)
              }
              onAddAnnotation={handleAddAnnotation}
              onRemoveAnnotation={handleRemoveAnnotation}
              onPaste={handlePaste}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mt-6 px-2 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                  isOverLimit
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800",
                )}
              >
                {charCount} / {limit}
              </div>
              {isOverLimit && (
                <span className="text-[10px] text-red-500 font-bold uppercase animate-pulse">
                  Limit Exceeded
                </span>
              )}
            </div>

            {globalTheme.showFooter && (
              <div className="flex items-center gap-6 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div
                  className="flex items-center gap-2 text-gray-400 group"
                  title="Replies"
                >
                  <MessageCircle
                    size={14}
                    className="group-hover:text-blue-500 transition-colors"
                  />
                  <input
                    type="number"
                    value={slide.stats?.replies || 0}
                    onChange={(e) =>
                      updateSlide(slide.id, {
                        stats: {
                          ...(slide.stats || {
                            likes: 0,
                            replies: 0,
                            shares: 0,
                          }),
                          replies: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-12 bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-gray-700 dark:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div
                  className="flex items-center gap-2 text-gray-400 group"
                  title="Shares"
                >
                  <Repeat2
                    size={14}
                    className="group-hover:text-green-500 transition-colors"
                  />
                  <input
                    type="number"
                    value={slide.stats?.shares || 0}
                    onChange={(e) =>
                      updateSlide(slide.id, {
                        stats: {
                          ...(slide.stats || {
                            likes: 0,
                            replies: 0,
                            shares: 0,
                          }),
                          shares: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-12 bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-gray-700 dark:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div
                  className="flex items-center gap-2 text-gray-400 group"
                  title="Likes"
                >
                  <Heart
                    size={14}
                    className="group-hover:text-pink-500 transition-colors"
                  />
                  <input
                    type="number"
                    value={slide.stats?.likes || 0}
                    onChange={(e) =>
                      updateSlide(slide.id, {
                        stats: {
                          ...(slide.stats || {
                            likes: 0,
                            replies: 0,
                            shares: 0,
                          }),
                          likes: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-12 bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-gray-700 dark:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                <button
                  type="button"
                  onClick={randomizeStats}
                  className="text-gray-400 hover:text-blue-500 transition-all hover:rotate-180 duration-500"
                  title="Randomize Stats"
                >
                  <Sparkles size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
