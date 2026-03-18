import { describe, expect, it } from "vitest";
import { PLATFORM_LIMITS, splitTextContent } from "@/utils/textUtils";

describe("Text Utils", () => {
  it("should have correct platform limits", () => {
    expect(PLATFORM_LIMITS.twitter).toBe(140);
    expect(PLATFORM_LIMITS.linkedin).toBe(300);
    expect(PLATFORM_LIMITS.instagram).toBe(200);
    expect(PLATFORM_LIMITS.tiktok).toBe(250);
  });

  it("should split long text correctly", () => {
    const limit = 10;
    const text = "Short. This is a very long sentence that should be split.";
    const chunks = splitTextContent(text, limit);

    // "Short." (6) -> chunk 1
    // "This is a" (9) -> chunk 2
    // "very long" (9) -> chunk 3
    // "sentence" (8) -> chunk 4
    // "that" (4) -> chunk 5
    // "should be" (9) -> chunk 6
    // "split." (6) -> chunk 7

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(limit);
    });
  });

  it("should keep paragraphs together if they fit", () => {
    const limit = 50;
    const text = "Para 1\n\nPara 2";
    const chunks = splitTextContent(text, limit);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe("Para 1");
    expect(chunks[1]).toBe("Para 2");
  });
});
