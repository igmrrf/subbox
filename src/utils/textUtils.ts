export const PLATFORM_LIMITS: Record<string, number> = {
    twitter: 140,   // Reduced from 280 to fit visual card better
    linkedin: 300,  // Reduced from 500
    instagram: 200, // Reduced from 400
    tiktok: 250,    // Reduced from 400
};

export function splitTextContent(text: string, limit: number): string[] {
    const chunks: string[] = [];
    const normalized = text.replace(/\r\n/g, '\n');
    const paragraphs = normalized.split(/\n\n+/);
    
    for (const para of paragraphs) {
        if (para.length <= limit) {
            chunks.push(para);
        } else {
            const words = para.split(' ');
            let currentChunk = '';
            
            for (const word of words) {
                if ((currentChunk + ' ' + word).length > limit) {
                    if (currentChunk) chunks.push(currentChunk.trim());
                    currentChunk = word;
                } else {
                    currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
                }
            }
            if (currentChunk) chunks.push(currentChunk.trim());
        }
    }
    return chunks;
}