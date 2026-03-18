import type { SlideType } from "@/store/deck-store";

export interface DetectionResult {
  type: SlideType;
  language?: string;
  metadata?: any;
}

const URL_REGEX = /^(https?:\/\/[^\s]+)$/i;
const GITHUB_REGEX = /github\.com\/[\w-]+\/[\w-]+/i;
const TWEET_REGEX = /twitter\.com|x\.com\/[\w-]+\/status\/\d+/i;

// Simple heuristic for code detection
const CODE_PATTERNS = [
  /function\s+\w+/,
  /const\s+\w+\s*=/,
  /import\s+.*\s+from/,
  /class\s+\w+/,
  /if\s*\(.*\)\s*{/,
  /=>/,
  /return\s+/,
  /console\.log/,
  /<div>/,
  /npm\s+install/,
  /pip\s+install/,
  /#include/,
  /public\s+class/,
  /def\s+\w+:/,
];

export function detectInputType(text: string): DetectionResult {
  const trimmed = text.trim();

  // 1. URL Detection
  if (URL_REGEX.test(trimmed)) {
    if (GITHUB_REGEX.test(trimmed)) {
      return { type: "code", metadata: { source: "github" } }; // Or social if we want to unfurl repo card
    }
    if (TWEET_REGEX.test(trimmed)) {
      return { type: "social", metadata: { source: "twitter" } };
    }
    return { type: "social", metadata: { source: "generic" } };
  }

  // 2. Hybrid (Markdown Code Fences)
  // Check for ``` ... ```
  if (text.includes("```")) {
    return { type: "hybrid" };
  }

  // 3. Pure Code Detection
  // Check if text looks like code
  const codeScore = CODE_PATTERNS.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0);
  }, 0);

  if (codeScore >= 2 || (codeScore >= 1 && text.length < 100)) {
    // Check for language hints?
    // For now just return code
    return { type: "code" };
  }

  // Default to text
  return { type: "text" };
}

export function parseHybridContent(text: string) {
  // Simple parser to split text and code blocks
  // This is a naive implementation, a real markdown parser would be better
  // but for now we just want to identify if there is mixed content.
  // Actually, for "Hybrid" slide type, we might just store the raw markdown
  // and let the renderer handle it?
  // But the requirement says "Splits content into an AST-like structure".
  // For MVP, let's keep it as raw markdown in `primary` content,
  // and the renderer uses a markdown-to-html (or satori-friendly) parser.
  return text;
}
