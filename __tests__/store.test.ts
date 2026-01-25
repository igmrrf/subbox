import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from '@/store/deck-store';

describe('Deck Store', () => {
    beforeEach(() => {
        useDeckStore.setState({ 
            slides: [], 
            globalTheme: { platform: 'twitter', mode: 'light', fontSize: 'large' } 
        });
    });

    it('should add a slide', () => {
        const { addSlide } = useDeckStore.getState();
        addSlide();
        const { slides } = useDeckStore.getState();
        expect(slides).toHaveLength(1);
    });

    it('should update a slide', () => {
        const { addSlide } = useDeckStore.getState();
        addSlide();
        const slideId = useDeckStore.getState().slides[0].id;

        useDeckStore.getState().updateSlide(slideId, { content: 'Updated Content' });
        
        const updatedSlide = useDeckStore.getState().slides.find(s => s.id === slideId);
        expect(updatedSlide?.content).toBe('Updated Content');
    });

    it('should remove a slide', () => {
        const { addSlide, removeSlide } = useDeckStore.getState();
        addSlide();
        const slideId = useDeckStore.getState().slides[0].id;
        
        removeSlide(slideId);
        expect(useDeckStore.getState().slides).toHaveLength(0);
    });

    it('should move a slide', () => {
        const { addSlides, moveSlide } = useDeckStore.getState();
        addSlides(['Slide 1', 'Slide 2', 'Slide 3']);
        
        // Move Slide 1 (index 0) to position 2 (index 2)
        // [1, 2, 3] -> [2, 3, 1]
        moveSlide(0, 2);
        
        const slides = useDeckStore.getState().slides;
        expect(slides[0].content).toBe('Slide 2');
        expect(slides[1].content).toBe('Slide 3');
        expect(slides[2].content).toBe('Slide 1');
    });
});