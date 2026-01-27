import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { persist } from "zustand/middleware";
import { splitTextContent, PLATFORM_LIMITS } from "@/utils/textUtils";
export const Author = {
  name: "Subbox",
  handle: "@subbox",
  avatar: "/user.webp",
};

export interface Slide {
  id: string;
  content: string;
  theme: string;
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
  windowChrome: boolean;
  cardStyle: "glass" | "solid" | "flat";
  autoSplit: boolean;
  background?: string; // Custom CSS background (color or gradient)
  author?: {
    name: string;
    handle: string;
    avatar: string;
  };
  showFooter: boolean;
}

const generateRandomStats = () => ({
  likes: Math.floor(Math.random() * (50000 - 100 + 1)) + 100,
  replies: Math.floor(Math.random() * 5000),
  shares: Math.floor(Math.random() * 10000),
});

interface DeckState {
  slides: Slide[];
  globalTheme: GlobalTheme;
  sourceText: string;
  addSlide: () => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  setSlides: (slides: Slide[]) => void;
  duplicateSlide: (id: string) => void;
  moveSlide: (oldIndex: number, newIndex: number) => void;
  setGlobalTheme: (theme: Partial<GlobalTheme>) => void;
  addSlides: (contents: string[]) => void;
  setSourceText: (text: string) => void;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      slides: [
        {
          id: "default-slide",
          content: "Welcome to Subbox!",
          theme: "twitter",
          author: Author,
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
      ],
      globalTheme: {
        platform: "twitter",
        mode: "light",
        fontSize: "large",
        windowChrome: true,
        cardStyle: "solid",
        autoSplit: true,
        showFooter: true,
      },
      sourceText: "",

      addSlide: () =>
        set((state) => ({
          slides: [
            ...state.slides,
            {
              id: uuidv4(),
              content: "",
              theme: "twitter",
              author: Author,
              stats: generateRandomStats(),
              date: new Date().toLocaleDateString("en-GB", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
          ],
        })),

      addSlides: (contents) =>
        set((state) => ({
          slides: [
            ...state.slides,
            ...contents.map((content) => ({
              id: uuidv4(),
              content,
              theme: "twitter",
              author: Author,
              stats: generateRandomStats(),
              date: new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            })),
          ],
        })),

      updateSlide: (id, updates) =>
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === id ? { ...slide, ...updates } : slide,
          ),
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
          // Duplicate should clone stats, not randomize
          const newSlide = { ...slideToClone, id: uuidv4() };
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

          // If platform changed and we have sourceText AND autoSplit is enabled
          if (
            themeUpdates.platform &&
            themeUpdates.platform !== state.globalTheme.platform &&
            state.sourceText &&
            newTheme.autoSplit
          ) {
            // Check newTheme.autoSplit in case it was toggled on same update (unlikely but safe)

            const limit = PLATFORM_LIMITS[newTheme.platform] || 280;
            const newContents = splitTextContent(state.sourceText, limit);

            const newSlides = newContents.map((content) => ({
              id: uuidv4(),
              content,
              theme: newTheme.platform,
              author: Author,
              stats: generateRandomStats(),
              date: new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            }));

            return {
              globalTheme: newTheme,
              slides: newSlides,
            };
          }

          return { globalTheme: newTheme };
        });
      },
    }),
    {
      name: "subbox-storage",
    },
  ),
);
