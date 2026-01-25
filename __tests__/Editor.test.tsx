import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '@/components/Editor';
import { useDeckStore } from '@/store/deck-store';

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Editor Component', () => {
    it('renders slides from store', () => {
        useDeckStore.setState({
            slides: [
                { id: '1', content: 'Slide 1', theme: 'twitter' },
                { id: '2', content: 'Slide 2', theme: 'twitter' }
            ],
            globalTheme: { platform: 'twitter', mode: 'light', fontSize: 'large' }
        });

        render(<Editor />);
        
        expect(screen.getAllByText('Slide 1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Slide 2').length).toBeGreaterThan(0);
    });

    it('updates slide content on textarea change', () => {
        useDeckStore.setState({
             slides: [{ id: '1', content: '', theme: 'twitter' }],
             globalTheme: { platform: 'twitter', mode: 'light', fontSize: 'large' }
        });

        render(<Editor />);
        
        const textarea = screen.getByPlaceholderText('Enter your text here...');
        fireEvent.change(textarea, { target: { value: 'New text' } });

        const slide = useDeckStore.getState().slides[0];
        expect(slide.content).toBe('New text');
    });
});
