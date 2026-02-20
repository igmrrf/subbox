# Subbox Technical Documentation

## Project Structure

```
/src
  /app          # Next.js App Router pages and API routes
    /api        # Server-side API endpoints (Generation, Unfurl)
    /layout.tsx # Root layout with fonts and metadata
    /page.tsx   # Main application page
  /components   # React components (UI, Logic)
  /store        # Global state management (Zustand)
  /utils        # Helper functions (Color extraction, Image gen, Detectors)
/public         # Static assets (fonts, icons)
```

## Key Components

- **`Editor.tsx`**: The main interface managing the list of slides.
- **`SlideCard.tsx`**: The container for each slide, handling controls and the preview wrapper.
- **`SlidePreview.tsx`**: The core WYSIWYG component. It renders the slide exactly as it will be exported and handles in-place editing via "Click-to-Edit".
- **`ThemeSelector.tsx`**: UI for configuring global settings (Platform, Brand, Frames).
- **`AnnotationLayer.tsx`**: An SVG overlay component for rendering arrows, circles, and highlights on top of slides.

## State Management

We use **Zustand** for global state management. The store is defined in `src/store/deck-store.ts`.

### `Slide` Interface
```typescript
interface Slide {
  id: string;
  type: 'code' | 'social' | 'text' | 'diff' | 'hybrid';
  layout: 'single' | 'split' | 'stack';
  content: {
    primary: string;
    secondary?: string;
  };
  settings: {
    frame: 'macos' | 'windows' | 'phone' | 'none';
    theme: string;
    // ...
  };
  annotations: Annotation[];
  // ...
}
```

## Features & Implementation Details

### 1. Smart Input Detection
**Location:** `src/utils/inputDetector.ts`
- Automatically detects content type (URL, Code, Text) upon paste.
- Regex-based detection for social URLs (Twitter, GitHub).
- Heuristic detection for code blocks.

### 2. Syntax Highlighting
**Location:** `src/utils/highlighter.tsx` (Client) & `/api/generate` (Server)
- Uses **Shiki** for high-fidelity syntax highlighting.
- **Client:** Asynchronous hook `useHighlighter` loads Shiki on demand to highlight the preview editor.
- **Server:** API route uses `codeToTokens` to render highlighting in the final PNG.

### 3. Layouts & Frames
- **Layouts:** Single, Split (Grid), and Stack (Flex Column). Supported in both `SlidePreview` and the generation API.
- **Frames:** MacOS, Windows, Phone, and Minimal (None). Implemented as conditional render blocks wrapping the content.

### 4. Brand Kit & Color Extraction
**Location:** `src/utils/colorExtractor.ts`
- Uses HTML Canvas API to analyze uploaded logo images.
- Extracts dominant colors to automatically populate the "Brand Colors" palette.

### 5. Annotations
**Location:** `src/components/AnnotationLayer.tsx`
- SVG overlay that sits on top of the slide content.
- Supports rendering Arrows and Circles (extensible for more).
- Framer Motion is used for entry animations.

## Image Generation API

**Endpoint:** `POST /api/generate`

This endpoint generates a high-quality PNG image from the slide content.

### Workflow:
1.  **Request:** Receives JSON body with `text` (primary), `secondaryText`, `layout`, `frame`, `type`, etc.
2.  **Logic:**
    - Resolves layout dimensions (16:9, 1:1, etc.).
    - Loads local fonts (`Inter-Medium.woff`).
    - **Highlighting:** If type is `code` or `diff`, runs Shiki server-side to generate colored tokens.
3.  **Satori:** Converts the React JSX structure (mirroring `SlidePreview` logic) into an SVG string.
4.  **Resvg:** Renders the SVG into a PNG buffer.
5.  **Response:** Returns the binary PNG.

## Deployment

The project is configured for deployment on Vercel.
- **Next.js Config:** `serverExternalPackages` includes `@resvg/resvg-js` and `sharp`.
- **Runtime:** The API route uses the Node.js runtime (`export const runtime = "nodejs"`) to support Shiki and fs operations.