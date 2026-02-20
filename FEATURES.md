# Subbox - Features & Implementation Roadmap

Subbox is a minimalistic tool designed to turn text-heavy content into visually engaging graphics for social media platforms.

## Phase 1: Foundation & State Management
**Goal:** Establish the project structure and core state management for the "Slide Deck."

### Features
1.  **Project Setup**: Next.js (App Router), TypeScript, Tailwind CSS (v4).
2.  **State Management (Zustand)**: Create the central store to manage the "Deck" of slides.
    *   State structure: `[{ id: string, type: 'code' | 'social' | 'text' | 'diff' | 'hybrid', content: { primary: string, secondary?: string }, settings: { ... } }]`.
3.  **Basic Layout**: Sidebar for controls, Main area for the "Slide" preview.

### Implementation Plan
- [x] Initialize Next.js project with `bun create next-app`.
- [x] Install dependencies: `zustand`, `clsx`, `tailwind-merge`, `lucide-react` (or `@phosphor-icons/react`).
- [x] Create `useDeckStore` in `src/store/deck-store.ts`.
    -   Actions: `addSlide`, `updateSlide`, `removeSlide`, `setSlides`.
    -   Refactor to support enhanced `Slide` interface with `layout`, `settings`, and `content` object (primary/secondary).
- [x] Create a basic `Editor` component that maps through slides and renders a `textarea` for each.

### Test Cases
- [x] **TC-1.1**: App loads without errors.
- [x] **TC-1.2**: User can type into a text area, and the Zustand store updates (verify via Redux DevTools or console).
- [x] **TC-1.3**: Layout is responsive (mobile/desktop).

---

## Phase 2: Core Editor Mechanics & Smart Input
**Goal:** Allow users to manipulate the content effectively with smart detection.

### Features
1.  **Multi-Step Interface**: Visual representation of slides (cards).
2.  **Smart Input Engine**:
    *   **Unified Input**: Detects URL vs Code vs Text vs Hybrid Mixed Content.
    *   **Auto-Detection**: Regex for URLs (Twitter/X, GitHub), Heuristics for Code.
    *   **Hybrid Mode**: Detects Markdown code fences embedded in text.
3.  **Drag-to-Reorder**: Rearrange slides for storytelling.

### Implementation Plan
- [x] Implement `SlideCard` component.
- [x] Integrate `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop.
- [ ] Implement `InputDetector` utility:
    -   Regex checks for URLs (trigger metadata fetch).
    -   Heuristic checks for Code (brackets, keywords) -> trigger `shiki`.
    -   Markdown fence detection -> set type to `hybrid`.
- [x] Add "Duplicate" and "Delete" actions to `useDeckStore`.
- [x] Ensure animations for adding/removing slides using `framer-motion`.

### Test Cases
- [x] **TC-2.1**: Clicking "Add Slide" increases the slide count by 1.
- [ ] **TC-2.2**: Pasting a GitHub URL automatically switches slide type to 'social' or 'code'.
- [ ] **TC-2.3**: Pasting code blocks automatically switches slide type to 'code' and detects language.
- [x] **TC-2.4**: Dragging Slide 1 to position 3 correctly updates the array order.

---

## Phase 3: The Rendering Engine (Satori) & Visual Layouts
**Goal:** Convert DOM/Component state into high-quality images with flexible layouts.

### Features
1.  **Visual & Layout Engine**:
    *   **CanvasFrame**: Parent container handling backgrounds (gradient/image).
    *   **WindowChrome**: Device wrappers (MacOS, Windows, Phone).
    *   **Layouts**: Single, Split (Grid), Stack (Flex Column).
2.  **Image Generation**: Satori (SVG) + Resvg (PNG).
3.  **Preview Mode**: Real-time preview of the final export.

### Implementation Plan
- [x] Create a `Preview` component matching export styling.
- [ ] Implement Layout Components:
    -   `SplitLayout`: CSS Grid for side-by-side (Code + Explanation).
    -   `StackLayout`: Flex column for top-bottom (Social + Code).
- [x] Implement internal API/logic for Satori generation.
- [x] Create `generateImage(slideData)` utility.

### Test Cases
- [x] **TC-3.1**: "Generate Preview" renders an SVG matching input.
- [ ] **TC-3.2**: Switching layout to "Split" correctly positions primary and secondary content.
- [x] **TC-3.3**: Text wrapping matches the preview component.

---

## Phase 4: Theming & Platform Intelligence
**Goal:** Tailor output for platforms with smart backgrounds and patterns.

### Features
1.  **Platform Presets**: Twitter (16:9), LinkedIn (4:5), Instagram (1:1), TikTok (9:16).
2.  **Smart Backgrounds**:
    *   **ColorExtractor**: Sample colors from uploaded brand logos.
    *   **Pattern Generator**: Create SVG patterns.
3.  **Theme Toggles**: Dark/Light, Adaptive Typography.

### Implementation Plan
- [x] Create `ThemeContext` or extend `useDeckStore`.
- [x] Build `ThemeSelector` component.
- [ ] Implement `ColorExtractor` utility for brand consistency.
- [x] Create style maps for platforms (`PLATFORM_STYLES`).
- [x] Update `SlideCard` and Satori templates.

### Test Cases
- [x] **TC-4.1**: Switching to "Instagram" changes aspect ratio to 1:1.
- [ ] **TC-4.2**: Uploading a logo updates the "Brand Colors" palette.
- [x] **TC-4.3**: "Browser Window" chrome is visible only when selected/relevant.

---

## Phase 5: Export Engine
**Goal:** Deliver final assets (Images/ZIP).

### Features
1.  **Single/Bulk Export**: PNG/ZIP downloads.
2.  **Clipboard Copy**: Quick paste support.
3.  **SEO & Accessibility**: Auto-generated Alt-Text.

### Implementation Plan
- [x] Install `jszip`, `file-saver`.
- [x] Implement `handleDownloadSingle`, `handleDownloadZip`, `handleCopy`.
- [ ] Add Alt-Text generation logic based on slide content.

### Test Cases
- [x] **TC-5.1**: Clicking "Download PNG" initiates file download.
- [x] **TC-5.2**: Clicking "Export All" downloads a correct `.zip`.
- [x] **TC-5.3**: Extracted images follow naming convention.

---

## Phase 6: UX Enhancements (Smart Paste & Annotations)
**Goal:** Remove friction and add storytelling layers.

### Features
1.  **Smart Paste / Auto-Split**:
    *   **Text**: Split by paragraph/character limit.
    *   **Code**: Smart splitting at logical boundaries (line breaks), preserving language metadata.
2.  **Annotation Layer**: Arrows, Blur, Highlighter, Magnifier (SVG overlay).
3.  **Diff View**: Comparison view for "Old" vs "New" code.

### Implementation Plan
- [x] Add `onPaste` handler.
- [x] Implement Text Auto-Split logic.
- [ ] Implement Code Auto-Split logic (preserve language, avoid token breaks).
- [ ] Create `AnnotationLayer` component (absolute positioned SVG).
- [ ] Implement `DiffRenderer` for side-by-side code comparison.

### Test Cases
- [x] **TC-6.1**: Pasting 500 characters triggers "Auto-split".
- [ ] **TC-6.2**: Pasting a long code block splits it without breaking syntax highlighting.
- [x] **TC-6.3**: Confirming split creates multiple slides.

---

## Phase 7: Local & Offline (PWA)
**Goal:** Robust, accessible app.

### Features
1.  **Persistence**: `localStorage` (via Zustand persist).
2.  **PWA**: Offline support.

### Implementation Plan
- [x] Integrate `zustand/middleware` (`persist`).
- [x] Configure `next-pwa`.
- [x] Add `manifest.json`.

### Test Cases
- [x] **TC-7.1**: Refreshing retains state.
- [x] **TC-7.2**: Offline load works.

---

## Phase 8: Advanced Integrations & Video (Future)
**Goal:** External data, rich media, and motion.

### Features
1.  **Rich Media**: URL-to-Image (OG tags), Custom Branding.
2.  **Syntax Highlighting**: Shiki integration.
3.  **Motion/Video (MVP V2)**:
    *   **Video Gen**: `ffmpeg.wasm` or Remotion.
    *   **Effects**: Typewriter, Scroll.

### Implementation Plan
- [x] Create API route `/api/unfurl`.
- [x] Add file upload for "Brand Logo".
- [ ] Integrate `shiki` for server/client-side highlighting.
- [ ] Research/Integrate `ffmpeg.wasm` for basic video export.

### Test Cases
- [x] **TC-8.1**: Pasting GitHub link fetches metadata.
- [ ] **TC-8.2**: Shiki correctly highlights code blocks in preview.