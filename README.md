# Subbox

**Subbox** is a modern tool designed to turn your text into beautiful, shareable social media graphics. Whether you're posting to Twitter, LinkedIn, Instagram, or TikTok, Subbox allows you to customize your message with different themes, window styles, and branding.

![Subbox Preview](public/file.svg)

## 🚀 Features

- **Multi-Platform Support:** Optimized presets for Twitter (X), LinkedIn, Instagram, and TikTok.
- **Customizable Themes:** Switch between Light and Dark modes.
- **Dynamic Backgrounds:** Choose from platform-specific gradients or solid colors.
- **Window Chrome:** Toggle a browser-like window chrome with macOS-style traffic lights.
- **Card Styles:** Choose between 'Solid', 'Glass' (backdrop blur), or 'Flat' card designs.
- **Smart Typography:** Adaptive font sizing that adjusts based on your text length.
- **Drag & Drop:** (Coming soon/Architecture ready) Sortable slide list for multi-slide content.
- **Image Generation:** Server-side image generation using `satori` and `@resvg/resvg-js` for high-quality PNG export.
- **PWA Support:** Installable as a Progressive Web App.

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Image Generation:** [Satori](https://github.com/vercel/satori) + [Resvg](https://github.com/yisibl/resvg-js)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Linting/Formatting:** [Biome](https://biomejs.dev/)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/subbox.git
    cd subbox
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Running Tests

This project uses Vitest for unit and integration testing.

```bash
npm run test
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.