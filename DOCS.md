# Subbox Technical Documentation

## Project Structure

```
/src
  /app          # Next.js App Router pages and API routes
    /api        # Server-side API endpoints
    /layout.tsx # Root layout with fonts and metadata
    /page.tsx   # Main application page
  /components   # React components (UI, Logic)
  /store        # Global state management (Zustand)
  /utils        # Helper functions
/public         # Static assets (fonts, icons)
```

## Key Components

- **`Editor.tsx`**: The main interface where users input text and configure settings.
- **`SlidePreview.tsx`**: Visual representation of the generated image. This component mirrors the logic in the generation API to ensure "what you see is what you get" (WYSIWYG).
- **`ThemeSelector.tsx`**: UI for selecting platforms, colors, and fonts.
- **`SmartPasteModal.tsx`**: Feature for parsing content from external sources (e.g., pasting a thread).

## State Management

We use **Zustand** for global state management. The store is defined in `src/store/deck-store.ts`.

### `GlobalTheme` Interface
Controls the visual appearance of the slide:
- `platform`: 'twitter' | 'linkedin' | 'instagram' | 'tiktok'
- `mode`: 'light' | 'dark'
- `background`: CSS gradient or color string.
- `windowChrome`: Boolean to toggle the browser-like header.
- `cardStyle`: 'solid' | 'glass' | 'flat'
- `fontSize`: 'medium' | 'large' | 'huge'

## Image Generation API

**Endpoint:** `POST /api/generate`

This endpoint generates a high-quality PNG image from the slide content.

### Workflow:
1.  **Request:** Receives JSON body with `text` and `theme` configuration.
2.  **Logic:**
    - Validates input.
    - Resolves layout dimensions based on the selected platform (e.g., 16:9 for Twitter, 1:1 for Instagram).
    - Calculates adaptive font sizes based on text length.
    - Loads the local font file (`Inter-Medium.woff`) from the `public` directory.
3.  **Satori:** Converts a React JSX structure (mirroring `SlidePreview.tsx`) into an SVG string.
    - Uses a `SCALE` factor (2.4) to generate high-resolution assets suitable for social media.
4.  **Resvg:** Renders the SVG into a PNG buffer using `@resvg/resvg-js` for accurate text rendering and layout.
5.  **Response:** Returns the binary PNG data with `Content-Type: image/png`.

### Font Loading
The API explicitly loads fonts from the filesystem (`fs`) to avoid network issues during server-side generation. We use `Inter-Medium.woff`.

## Deployment

The project is configured for deployment on Vercel.
- **Next.js Config:** `serverExternalPackages` includes `@resvg/resvg-js` to ensure the native binary is correctly handled in the serverless environment.
