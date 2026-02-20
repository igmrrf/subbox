"use client";

import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter as ShikiHighlighter } from "shiki";

let highlighterPromise: Promise<ShikiHighlighter> | null = null;

function getHighlighterInstance() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark", "nord", "catppuccin-macchiato"],
      langs: [
        "javascript",
        "typescript",
        "json",
        "python",
        "html",
        "css",
        "bash",
      ],
    });
  }
  return highlighterPromise;
}

export function useHighlighter(
  code: string,
  language: string,
  theme: "light" | "dark",
) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getHighlighterInstance().then((highlighter) => {
      if (!mounted) return;
      try {
        const highlighted = highlighter.codeToHtml(code, {
          lang: language || "javascript",
          theme: theme === "dark" ? "catppuccin-macchiato" : "github-light",
        });
        setHtml(highlighted);
      } catch (e) {
        console.error("Highlighting error:", e);
        setHtml(null); // Fallback to plain text logic in parent
      }
    });

    return () => {
      mounted = false;
    };
  }, [code, language, theme]);

  return html;
}
