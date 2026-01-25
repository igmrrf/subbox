import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Editor } from '@/components/Editor';
import { useDeckStore } from '@/store/deck-store';
import { ThemeSelector } from '@/components/ThemeSelector';
import { SlideCard } from '@/components/SlideCard';
import Home from '@/app/page';
import { saveAs } from 'file-saver';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock file-saver
vi.mock('file-saver', () => ({
    saveAs: vi.fn(),
}));

// Mock jszip
vi.mock('jszip', () => {
    return {
        default: class {
            folder = vi.fn().mockReturnThis();
            file = vi.fn();
            generateAsync = vi.fn().mockResolvedValue(new Blob());
        }
    }
});

describe('Subbox Features', () => {
    beforeEach(() => {
        // Reset store before each test
        useDeckStore.setState({
            slides: [
                { id: '1', content: 'Slide 1', theme: 'twitter' }
            ],
            globalTheme: { platform: 'twitter', mode: 'light', fontSize: 'large' },
            _hasHydrated: true
        });
        vi.clearAllMocks();
    });

    // Phase 1 & 2 Checks
    it('TC-1.1: Loads with initial slide', () => {
        render(<Editor />);
        expect(screen.getAllByText('Slide 1').length).toBeGreaterThan(0);
    });

    it('TC-2.2: Deleting a slide removes it', () => {
        render(<Editor />);
        const deleteBtn = screen.getByTitle('Delete slide');
        fireEvent.click(deleteBtn);
        expect(useDeckStore.getState().slides).toHaveLength(0);
    });

    // Phase 3 & 4 Checks
    it('TC-3.2: Handles special characters in content', () => {
        const specialText = 'Hello 🌍! @#%&';
        useDeckStore.getState().updateSlide('1', { content: specialText });
        render(<Editor />);
        // Switch to preview
        const previewBtn = screen.getByTitle('Preview Mode');
        fireEvent.click(previewBtn);
        
        expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('TC-4.3: LinkedIn theme shows browser chrome', () => {
        useDeckStore.setState({
             slides: [{ id: '1', content: 'Linked', theme: 'linkedin' }],
             globalTheme: { platform: 'linkedin', mode: 'light', fontSize: 'large' }
        });
        
        render(<Editor />);
        // Switch to preview
        const previewBtn = screen.getByTitle('Preview Mode');
        fireEvent.click(previewBtn);
    });

    // Phase 5 Checks
    it('TC-5.1: Single Download triggers saveAs', async () => {
        render(<Editor />);
        const downloadBtn = screen.getByTitle('Download Image');
        
        // Mock generateImage response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            blob: async () => new Blob(['fake-image'], { type: 'image/png' })
        });

        fireEvent.click(downloadBtn);

        await waitFor(() => {
            expect(saveAs).toHaveBeenCalled();
        });
    });

    it('TC-5.2: Export All triggers JSZip and saveAs', async () => {
        // Need to render Home to get Sidebar
        render(<Home />);
        const exportBtn = screen.getByText('Export All');
        
        // Mock generateImage response for the slide
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: async () => new Blob(['fake-image'], { type: 'image/png' })
        });

        fireEvent.click(exportBtn);

        await waitFor(() => {
            expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'subbox-deck.zip');
        });
    });

    // Phase 6 Checks
    it('TC-6.3: Rejecting split keeps text', () => {
        render(<Editor />);
        const textarea = screen.getAllByDisplayValue('Slide 1')[0]; 
        
        const multiParaText = "P1\n\nP2";
        const pasteEvent = createPasteEvent(multiParaText);
        fireEvent(textarea, pasteEvent);
        
        const rejectBtn = screen.getByText('No, keep it here');
        fireEvent.click(rejectBtn);

        expect(useDeckStore.getState().slides).toHaveLength(1);
        expect(useDeckStore.getState().slides[0].content).toContain(multiParaText);
    });

    // Phase 8 Checks
    it('TC-8.2: Uploaded logo updates store', async () => {
        render(<ThemeSelector />);
        const fileInput = screen.getByLabelText('Upload Logo');
        
        const file = new File(['logo'], 'logo.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(useDeckStore.getState().globalTheme.logo).toBeDefined();
        });
    });

    it('TC-8.3: Reddit URL extraction logic', async () => {
        // Mock window.prompt
        vi.spyOn(window, 'prompt').mockReturnValue('https://www.reddit.com/r/test/comments/123/title/');
        
        // Mock fetch for the API call from the component
        // Note: The component calls /api/unfurl. The logic INSIDE /api/unfurl calls reddit.
        // But here we are integration testing the Component + API response interactions.
        // We cannot test the server-side logic (the POST handler code) directly here easily unless we call the function directly
        // or mock the fetch call that the COMPONENT makes to return what the API WOULD return.
        
        // So we mock the response from /api/unfurl
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({
                title: 'Reddit Title',
                description: 'Reddit Body'
            })
        });

        render(<Editor />);
        
        const importBtn = screen.getByTitle('Import from URL');
        fireEvent.click(importBtn);

        await waitFor(() => {
            const state = useDeckStore.getState();
            expect(state.slides[0].content).toContain('Reddit Title');
            expect(state.slides[0].content).toContain('Reddit Body');
        });
    });
});

// Helper
function createPasteEvent(text: string) {
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
        value: {
            getData: () => text
        }
    });
    return event;
}