# Subbox - Features & Implementation Roadmap

Subbox is a minimalistic tool designed to turn text-heavy content into visually engaging graphics for social media platforms.

## Phase 1: Foundation & State Management
**Goal:** Establish the project structure and core state management for the "Slide Deck."

### Features
1.  **Project Setup**: Next.js (App Router), TypeScript, Tailwind CSS.
2.  **State Management (Zustand)**: Create the central store to manage the "Deck" of slides.
    *   State structure: `[{ id: string, content: string, theme: string }]`.
3.  **Basic Layout**: Sidebar for controls, Main area for the "Slide" preview.

### Implementation Plan
- [x] Initialize Next.js project with `bun create next-app`.
- [x] Install dependencies: `zustand`, `clsx`, `tailwind-merge`, `lucide-react` (or `@phosphor-icons/react`).
- [x] Create `useDeckStore` in `src/store/deck-store.ts`.
    -   Actions: `addSlide`, `updateSlide`, `removeSlide`, `setSlides`.
- [x] Create a basic `Editor` component that maps through slides and renders a `textarea` for each.

### Test Cases
- [x] **TC-1.1**: App loads without errors.
- [x] **TC-1.2**: User can type into a text area, and the Zustand store updates (verify via Redux DevTools or console).
- [x] **TC-1.3**: Layout is responsive (mobile/desktop).

---

## Phase 2: Core Editor Mechanics
**Goal:** Allow users to manipulate the content of the deck effectively.

### Features
1.  **Multi-Step Interface**: Visual representation of slides (cards) that can be edited.
2.  **Add/Remove Steps**: "Add Step" button duplicates current style or adds blank; "Delete" removes.
3.  **Drag-to-Reorder**: Rearrange slides for storytelling.

### Implementation Plan
- [x] Implement `SlideCard` component.
- [x] Integrate `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop functionality in the slide list.
- [x] Add "Duplicate" and "Delete" actions to `useDeckStore`.
- [x] Ensure animations for adding/removing slides using `framer-motion` (optional but recommended for polish).

### Test Cases
- [x] **TC-2.1**: Clicking "Add Slide" increases the slide count by 1.
- [x] **TC-2.2**: Clicking "Delete" on Slide 2 removes it and reindexes the list.
- [x] **TC-2.3**: Dragging Slide 1 to position 3 correctly updates the array order in the store.

---

## Phase 3: The Rendering Engine (Satori)
**Goal:** Convert DOM/Component state into high-quality images.

### Features
1.  **Image Generation**: Use `satori` to generate SVGs from React components.
2.  **PNG Conversion**: Use `resvg-wasm` (or `resvg-js`) to convert SVG to PNG.
3.  **Preview Mode**: Real-time preview of how the final image will look.

### Implementation Plan
- [x] Create a `Preview` component that mirrors the styling of the exportable image.
- [x] Implement an internal API route (or client-side logic if resizing `wasm` is manageable) for image generation.
    -   *Note: Satori works best on the server/Edge, but can run client-side.*
- [x] Create a `generateImage(slideData)` utility function.
    -   Input: Slide data, theme config.
    -   Output: Blob/DataURL.

### Test Cases
- [x] **TC-3.1**: "Generate Preview" renders an SVG that matches the input text.
- [x] **TC-3.2**: Generated image handles special characters and emojis correctly.
- [x] **TC-3.3**: Text wrapping in the image matches the preview component.

---

## Phase 4: Theming & Platform Intelligence
**Goal:** Tailor the output for specific social platforms.

### Features
1.  **Platform Presets**:
    *   **Twitter/X**: 16:9, Minimal UI, "Verification" badge toggle.
    *   **LinkedIn**: 4:5, "Browser Window" chrome.
    *   **Instagram**: 1:1, Glassmorphism/Gradient card.
    *   **TikTok**: 9:16, Transparent/Overlay style.
2.  **Theme Toggles**: Dark/Light mode, font size adjustment (Medium, Large, Huge).

### Implementation Plan
- [x] Create a `ThemeContext` or extend `useDeckStore` to include `globalTheme` settings.
- [x] Build a `ThemeSelector` UI component.
- [x] Create style maps for each platform:
    ```typescript
    const PLATFORM_STYLES = {
      twitter: { ratio: '16/9', padding: 'p-8', chrome: 'minimal' },
      linkedin: { ratio: '4/5', padding: 'p-6', chrome: 'browser' },
      // ...
    };
    ```
- [x] Update `SlideCard` and Satori templates to consume these props.

### Test Cases
- [x] **TC-4.1**: Switching to "Instagram" changes the aspect ratio of the preview container to 1:1.
- [x] **TC-4.2**: Switching to "Dark Mode" inverts text and background colors in the preview.
- [x] **TC-4.3**: "Browser Window" chrome is visible only when LinkedIn theme is selected.

---

## Phase 5: Export Engine
**Goal:** Deliver the final assets to the user.

### Features
1.  **Single Export**: Download current slide as PNG.
2.  **Export All (ZIP)**: Download all slides as a `.zip` file.
3.  **Clipboard Copy**: "Copy Image" button for quick pasting.

### Implementation Plan
- [x] Install `jszip` and `file-saver`.
- [x] Implement `handleDownloadSingle`: Triggers Satori generation -> `saveAs`.
- [x] Implement `handleDownloadZip`:
    -   Iterate through all slides.
    -   Generate Blobs for each.
    -   Add to JSZip folder.
    -   Generate ZIP blob -> `saveAs`.
- [x] Implement `handleCopy`: Uses `navigator.clipboard.write` with the Blob.

### Test Cases
- [x] **TC-5.1**: Clicking "Download PNG" initiates a file download ending in `.png`.
- [x] **TC-5.2**: Clicking "Export All" downloads a `.zip` containing correct number of images.
- [x] **TC-5.3**: Extracted images follow the naming convention `post-01.png`, `post-02.png`.

---

## Phase 6: UX Enhancements (Smart Paste)
**Goal:** Remove friction from the content creation process.

### Features
1.  **Smart Paste / Auto-Split**: Detect long text pastes and offer to split by paragraph.
2.  **Character Count Warning**: Visual indicator if text exceeds platform recommendations.

### Implementation Plan
- [x] Add `onPaste` handler to the text area.
- [x] Logic: `if (text.length > threshold) setModal({ open: true, content: text })`.
- [x] "Split" algorithm: `text.split('\n\n')` -> map to new slides -> append to store.

### Test Cases
- [x] **TC-6.1**: Pasting 500 characters triggers the "Auto-split" prompt.
- [x] **TC-6.2**: Confirming split creates multiple new slides with correct text segments.
- [x] **TC-6.3**: Rejecting split keeps all text in the current slide.

---

## Phase 7: Local & Offline (PWA)
**Goal:** Make the app robust and accessible anywhere.

### Features
1.  **Persistence**: Save drafts to `localStorage`.
2.  **PWA**: Offline support via Service Worker.

### Implementation Plan
- [x] Integrate `zustand/middleware` (`persist`).
- [x] configure `next-pwa` in `next.config.js`.
- [x] Add `manifest.json`.

### Test Cases
- [x] **TC-7.1**: Refreshing the page retains the current text and slides.
- [x] **TC-7.2**: Disconnecting network -> App still loads and generates images (if wasm is local).

---

## Phase 8: Advanced Integrations (Future)
**Goal:** External data fetching and rich media.

### Features
1.  **URL-to-Image**: Fetch metadata (OG tags, Twitter API) from a link.
2.  **Custom Branding**: Upload logo overlay.
3.  **Syntax Highlighting**: Code block support.

### Implementation Plan
- [x] Create API route `/api/unfurl` using `cheerio` or `puppeteer` (for rendering JS-heavy sites).
- [x] Add file upload input for "Brand Logo" -> convert to base64 -> store in state.
- [ ] Integrate `shiki` for code highlighting in Satori.

### Test Cases
- [x] **TC-8.1**: Pasting a GitHub link fetches the repo description and owner avatar.
- [x] **TC-8.2**: Uploaded logo appears in the top-right corner of the generated image.
