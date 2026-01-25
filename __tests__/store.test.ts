import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from '@/store/deck-store';

describe('Deck Store', () => {
    beforeEach(() => {
        useDeckStore.setState({ 
            slides: [], 
            sourceText: '',
            globalTheme: { 
                platform: 'twitter', 
                mode: 'light', 
                fontSize: 'large',
                windowChrome: true,
                cardStyle: 'solid',
                autoSplit: true
            } 
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
        
        moveSlide(0, 2);
        
        const slides = useDeckStore.getState().slides;
        expect(slides[0].content).toBe('Slide 2');
        expect(slides[1].content).toBe('Slide 3');
        expect(slides[2].content).toBe('Slide 1');
    });

    it('should set source text', () => {
        useDeckStore.getState().setSourceText('My source text');
        expect(useDeckStore.getState().sourceText).toBe('My source text');
    });

    it('should auto-split when platform changes and autoSplit is true', () => {
        // Twitter limit 140. Use text > 140 with spaces.
        // "word " is 5 chars. 30 words = 150 chars.
        const longText = "word ".repeat(40).trim(); 
        
        useDeckStore.setState({
            sourceText: longText,
            globalTheme: { 
                platform: 'linkedin', // limit 300, fits
                mode: 'light', 
                fontSize: 'large', 
                windowChrome: true,
                cardStyle: 'solid',
                autoSplit: true 
            },
            slides: [{ id: '1', content: longText, theme: 'linkedin' }]
        });

        // Change to twitter
        useDeckStore.getState().setGlobalTheme({ platform: 'twitter' });

        const state = useDeckStore.getState();
        expect(state.globalTheme.platform).toBe('twitter');
        expect(state.slides.length).toBeGreaterThan(1); 
    });

    it('should NOT auto-split when autoSplit is false', () => {
        const longText = "word ".repeat(40).trim();
        
        useDeckStore.setState({
            sourceText: longText,
            globalTheme: { 
                platform: 'linkedin', 
                mode: 'light', 
                fontSize: 'large', 
                windowChrome: true,
                cardStyle: 'solid',
                autoSplit: false // Disabled
            },
            slides: [{ id: '1', content: longText, theme: 'linkedin' }]
        });

        // Change to twitter
        useDeckStore.getState().setGlobalTheme({ platform: 'twitter' });

        const state = useDeckStore.getState();
        expect(state.globalTheme.platform).toBe('twitter');
        expect(state.slides).toHaveLength(1); // Should remain 1
        expect(state.slides[0].content).toBe(longText);
    });
});
