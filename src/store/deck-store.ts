import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';
import { splitTextContent, PLATFORM_LIMITS } from '@/utils/textUtils';

export interface Slide {
  id: string;
  content: string;
  theme: string;
}

export interface GlobalTheme {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'tiktok';
  mode: 'light' | 'dark';
  fontSize: 'medium' | 'large' | 'huge';
  logo?: string;
  windowChrome: boolean;
  cardStyle: 'glass' | 'solid' | 'flat';
  autoSplit: boolean;
}

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
        { id: uuidv4(), content: 'Welcome to Subbox!', theme: 'twitter' }
      ],
      globalTheme: {
        platform: 'twitter',
        mode: 'light',
        fontSize: 'large',
        windowChrome: true,
        cardStyle: 'solid',
        autoSplit: true,
      },
      sourceText: '',
      
      addSlide: () => set((state) => ({
        slides: [...state.slides, { id: uuidv4(), content: '', theme: 'twitter' }]
      })),

      addSlides: (contents) => set((state) => ({
        slides: [
          ...state.slides,
          ...contents.map(content => ({ id: uuidv4(), content, theme: 'twitter' }))
        ]
      })),

      updateSlide: (id, updates) => set((state) => ({
        slides: state.slides.map((slide) =>
          slide.id === id ? { ...slide, ...updates } : slide
        )
      })),

      removeSlide: (id) => set((state) => ({
        slides: state.slides.filter((slide) => slide.id !== id)
      })),

      setSlides: (slides) => set({ slides }),

      duplicateSlide: (id) => set((state) => {
        const index = state.slides.findIndex((s) => s.id === id);
        if (index === -1) return state;
        const slideToClone = state.slides[index];
        const newSlide = { ...slideToClone, id: uuidv4() };
        const newSlides = [...state.slides];
        newSlides.splice(index + 1, 0, newSlide);
        return { slides: newSlides };
      }),

      moveSlide: (oldIndex, newIndex) => set((state) => {
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
              if (themeUpdates.platform && 
                  themeUpdates.platform !== state.globalTheme.platform && 
                  state.sourceText && 
                  newTheme.autoSplit) { // Check newTheme.autoSplit in case it was toggled on same update (unlikely but safe)
                  
                  const limit = PLATFORM_LIMITS[newTheme.platform] || 280;
                  const newContents = splitTextContent(state.sourceText, limit);
                  
                  const newSlides = newContents.map(content => ({
                      id: uuidv4(),
                      content,
                      theme: newTheme.platform
                  }));

                  return {
                      globalTheme: newTheme,
                      slides: newSlides
                  };
              }

              return { globalTheme: newTheme };
          });
      },
    }),
    {
      name: 'subbox-storage',
    }
  )
);
