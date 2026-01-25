import { Slide, GlobalTheme } from '@/store/deck-store';

export async function generateImage(slide: Slide, theme: GlobalTheme): Promise<Blob> {
    const params = new URLSearchParams({
        text: slide.content,
        platform: theme.platform,
        mode: theme.mode,
        fontSize: theme.fontSize,
        windowChrome: String(theme.windowChrome),
        cardStyle: theme.cardStyle,
    });
    
    if (theme.logo) {
        params.append('logo', theme.logo);
    }
    
    const response = await fetch(`/api/generate?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to generate image');
    }
    return await response.blob();
}