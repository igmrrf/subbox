import type { Slide, GlobalTheme } from "@/store/deck-store";

export async function generateImage(
  slide: Slide,
  theme: GlobalTheme,
): Promise<Blob> {
  const params = {
    text: slide.content,
    platform: theme.platform,
    mode: theme.mode,
    fontSize: theme.fontSize,
    windowChrome: theme.windowChrome,
    cardStyle: theme.cardStyle,
    showFooter: theme.showFooter ?? true,
    ...(theme?.logo && { logo: theme.logo }),
    ...(theme?.background && { background: theme.background }),
    author: theme.author || slide.author,
    stats: slide.stats,
    date: slide.date,
  };

  const response = await fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error("Failed to generate image");
  }
  return await response.blob();
}
