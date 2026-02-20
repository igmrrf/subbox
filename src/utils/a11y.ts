import type { Slide } from "@/store/deck-store";

export function generateAltText(slide: Slide): string {
  let text = `Slide type: ${slide.type}. `;
  
  if (slide.type === 'code') {
      text += `Code snippet in ${slide.settings.language || 'text'}: `;
  } else if (slide.type === 'social') {
      text += `Social media post by ${slide.author.name}: `;
  }
  
  text += slide.content.primary;
  
  if (slide.content.secondary) {
      text += ` Secondary content: ${slide.content.secondary}`;
  }
  
  return text;
}
