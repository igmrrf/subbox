import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAllBrowserData } from "@/utils/storage";
import { PLATFORM_LIMITS, splitTextContent } from "@/utils/textUtils";

export const Author = {
  name: "Subbox",
  handle: "@subbox",
  avatar: "/user.webp",
};

export type SlideType = "code" | "social" | "text" | "hybrid";
export type SlideLayout = "single";
export type SlideFrame = "macos" | "windows" | "phone" | "none";

export interface SlideContent {
  primary: string;
  secondary?: string;
}

export interface SlideSettings {
  frame: SlideFrame;
  background?: string;
  language?: string; // For code/hybrid
  theme: string; // Platform theme (twitter, etc) or code theme
  padding: number;
  brandColors?: string[];
}

export interface Annotation {
  id: string;
  type: "arrow" | "circle" | "box" | "text" | "highlight";
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  content?: string; // For text annotation
  points?: number[]; // For arrow/line path
  rotation?: number;
}

export interface Slide {
  id: string;
  type: SlideType;
  layout: SlideLayout;
  content: SlideContent;
  settings: SlideSettings;
  annotations: Annotation[];

  // "Social" specific fields (kept at root for now for easier migration/access)
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  stats: {
    likes: number;
    replies: number;
    shares: number;
  };
  date: string;
}

export interface GlobalTheme {
  platform: "twitter" | "linkedin" | "instagram" | "tiktok";
  mode: "light" | "dark";
  fontSize: "medium" | "large" | "huge";
  logo?: string;
  windowChrome: boolean; // Keeping for backward compat, but UI should use frameStyle
  frameStyle: SlideFrame;
  cardStyle: "glass" | "solid" | "flat";
  autoSplit: boolean;
  background?: string;
  author?: {
    name: string;
    handle: string;
    avatar: string;
  };
  showFooter: boolean;
  brandColors: string[];
}

const INITIAL_THEME: GlobalTheme = {
  platform: "twitter",
  mode: "light",
  fontSize: "large",
  windowChrome: true,
  frameStyle: "macos",
  cardStyle: "solid",
  autoSplit: true,
  showFooter: true,
  brandColors: ["#3B82F6", "#10B981"], // Default brand colors
};

const generateRandomStats = () => ({
  likes: Math.floor(Math.random() * (50000 - 100 + 1)) + 100,
  replies: Math.floor(Math.random() * 5000),
  shares: Math.floor(Math.random() * 10000),
});

const createNewSlide = (content: string = "", theme: GlobalTheme): Slide => ({
  id: uuidv4(),
  type: "social",
  layout: "single",
  content: { primary: content },
  settings: {
    frame: theme.frameStyle || "macos",
    theme: theme.platform || "twitter",
    padding: 32,
  },
  annotations: [],
  author: theme.author || Author,
  stats: generateRandomStats(),
  date: new Date().toLocaleDateString("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
});

const INITIAL_SLIDES: Slide[] = [
  {
    ...createNewSlide("Welcome to Subbox!", INITIAL_THEME),
    id: "default-slide",
    stats: {
      likes: 4200,
      replies: 128,
      shares: 890,
    },
    date: new Date().toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  },
];

interface DeckState {
  slides: Slide[];
  globalTheme: GlobalTheme;
  sourceText: string;

  // Actions
  addSlide: () => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  updateAnnotation: (
    slideId: string,
    annotationId: string,
    updates: Partial<Annotation>,
  ) => void;
  removeSlide: (id: string) => void;
  setSlides: (slides: Slide[]) => void;
  duplicateSlide: (id: string) => void;
  moveSlide: (oldIndex: number, newIndex: number) => void;
  setGlobalTheme: (theme: Partial<GlobalTheme>) => void;
  addSlides: (contents: string[]) => void;
  setSourceText: (text: string) => void;
  reset: () => void;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, _get) => ({
      slides: INITIAL_SLIDES,
      globalTheme: INITIAL_THEME,
      sourceText: "",

      reset: () => {
        set({
          slides: INITIAL_SLIDES,
          globalTheme: INITIAL_THEME,
          sourceText: "",
        });
        clearAllBrowserData();
      },

      addSlide: () =>
        set((state) => ({
          slides: [...state.slides, createNewSlide("", state.globalTheme)],
        })),

      addSlides: (contents) =>
        set((state) => ({
          slides: [
            ...state.slides,
            ...contents.map((c) => createNewSlide(c, state.globalTheme)),
          ],
        })),

      updateSlide: (id, updates) =>
        set((state) => ({
          slides: state.slides.map((slide) => {
            if (slide.id !== id) return slide;
            return { ...slide, ...updates };
          }),
        })),

      updateAnnotation: (slideId, annotationId, updates) =>
        set((state) => ({
          slides: state.slides.map((slide) => {
            if (slide.id !== slideId) return slide;
            return {
              ...slide,
              annotations: slide.annotations.map((ann) => {
                if (ann.id !== annotationId) return ann;
                return { ...ann, ...updates };
              }),
            };
          }),
        })),

      removeSlide: (id) =>
        set((state) => ({
          slides: state.slides.filter((slide) => slide.id !== id),
        })),

      setSlides: (slides) => set({ slides }),

      duplicateSlide: (id) =>
        set((state) => {
          const index = state.slides.findIndex((s) => s.id === id);
          if (index === -1) return state;

          const slideToClone = state.slides[index];
          const newSlide = {
            ...slideToClone,
            id: uuidv4(),
            stats: { ...slideToClone.stats }, // Clone stats
          };

          const newSlides = [...state.slides];
          newSlides.splice(index + 1, 0, newSlide);
          return { slides: newSlides };
        }),

      moveSlide: (oldIndex, newIndex) =>
        set((state) => {
          const newSlides = [...state.slides];
          const [movedSlide] = newSlides.splice(oldIndex, 1);
          newSlides.splice(newIndex, 0, movedSlide);
          return { slides: newSlides };
        }),

      setSourceText: (text) => set({ sourceText: text }),

      setGlobalTheme: (themeUpdates) => {
        set((state) => {
          const newTheme = { ...state.globalTheme, ...themeUpdates };
          let newSlides = state.slides;

          // Update all slides to match new platform if platform changed
          if (themeUpdates.platform) {
            newSlides = newSlides.map((s) => ({
              ...s,
              settings: { ...s.settings, theme: themeUpdates.platform! },
            }));
          }

          // Auto-split logic
          if (
            themeUpdates.platform &&
            themeUpdates.platform !== state.globalTheme.platform &&
            state.sourceText &&
            newTheme.autoSplit
          ) {
            const limit = PLATFORM_LIMITS[newTheme.platform] || 280;
            const newContents = splitTextContent(state.sourceText, limit);

            newSlides = newContents.map((content) =>
              createNewSlide(content, newTheme),
            );
          }

          return {
            globalTheme: newTheme,
            slides: newSlides,
          };
        });
      },
    }),
    {
      name: "subbox-storage-v2", // Bump version to force reset or handle migration if needed
      // partialize: (state) => ({ ...state }),
      // For now, version bump in key is enough to avoid reading old invalid state
    },
  ),
);
