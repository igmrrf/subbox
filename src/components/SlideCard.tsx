"use client";

import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import {
  ClipboardCopy,
  Copy,
  Download,
  Eye,
  Heart,
  Link2,
  MessageCircle,
  PenLine,
  RefreshCw,
  Repeat2,
  Trash2,
} from "lucide-react";
import { type ClipboardEvent, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { type Slide, useDeckStore } from "@/store/deck-store";
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
    removeSlide,
    duplicateSlide,
    globalTheme,
    setSlides,
    setSourceText,
  } = useDeckStore();
  const [showPreview, setShowPreview] = useState(false);
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
      console.log({ blob });
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
      console.log({ blob });
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

      // Construct updates
      const updates: Partial<Slide> = {
        content: data.text || slide.content,
      };

      // Update Theme/Platform if detected
      if (data.platform) {
        updates.theme = data.platform;
        // Optionally update global theme to match if desired, but usually per-slide is safer?
        // The user asked for "platform as the logo".
        // We will update the slide's theme.
      }

      // Update Author
      if (data.author && (data.author.name || data.author.handle)) {
        updates.author = {
          name: data.author.name || slide.author.name,
          handle: data.author.handle || slide.author.handle,
          avatar: data.author.avatar || slide.author.avatar,
        };
      }

      // Update Stats
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

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    // Threshold check
    if (text.length > 280 || text.includes("\n\n")) {
      e.preventDefault();
      setPastedContent(text);
      setShowPasteModal(true);
    }
  };

  const handleConfirmSplit = () => {
    // Set Source Text for future resizes
    setSourceText(pastedContent);

    // Split based on current platform limit
    const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
    const chunks = splitTextContent(pastedContent, limit);

    const newSlides = chunks.map((content) => ({
      id: uuidv4(),
      content,
      theme: globalTheme.platform,
      author: slide.author,
      stats: { ...slide.stats }, // Clone stats or maybe set to 0 for new slides? Clone is probably safer/expected.
      date: slide.date,
    }));

    setSlides(newSlides);

    setShowPasteModal(false);
    setPastedContent("");
  };

  const handleCancelSplit = () => {
    updateSlide(slide.id, { content: slide.content + pastedContent });
    setSourceText("");
    setShowPasteModal(false);
    setPastedContent("");
  };

  const limit = PLATFORM_LIMITS[globalTheme.platform] || 280;
  const charCount = slide.content.length;
  const isOverLimit = charCount > limit;

  // Ensure defaults for older slides
  if (!slide.author && typeof window !== "undefined") {
    // This is a side-effect in render, which is bad, but for quick fix to store...
    // Better to handle it in the store or just let SlidePreview handle defaults (which it does).
    // SlidePreview handles it. GenerateImage passes undefined, API needs to handle it.
  }

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
          <span className="font-semibold text-gray-500">Slide {index + 1}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-gray-500 hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded cursor-pointer"
              title={showPreview ? "Edit Mode" : "Preview Mode"}
            >
              {showPreview ? <PenLine size={16} /> : <Eye size={16} />}
            </button>

            <button
              type="button"
              onClick={handleUnfurl}
              disabled={isUnfurling}
              className="text-gray-500 hover:text-purple-500 p-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded cursor-pointer disabled:opacity-50"
              title="Import from URL"
            >
              <Link2 size={16} />
            </button>

            {/* Export actions */}
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

        {showPreview ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <SlidePreview
              content={slide.content}
              theme={slide.theme}
              author={slide.author}
              stats={slide.stats}
              date={slide.date}
            />
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={slide.content}
              onChange={(e) =>
                updateSlide(slide.id, { content: e.target.value })
              }
              onPaste={handlePaste}
              className="w-full h-64 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-gray-100 font-sans text-lg"
              placeholder="Enter your text here..."
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? "text-red-500 font-bold" : "text-gray-400"}`}
            >
              {charCount} / {limit}
            </div>
          </div>
        )}

        {!showPreview && (
          <div className="flex items-center justify-end gap-4 mt-3 px-1">
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
        )}
      </motion.div>
    </>
  );
}
