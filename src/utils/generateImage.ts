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
    windowChrome: String(theme.windowChrome),
    cardStyle: theme.cardStyle,
    ...(theme?.logo && { logo: theme.logo }),
    ...(theme?.background && { background: theme.background }),
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
