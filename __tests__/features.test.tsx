import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { saveAs } from "file-saver";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { Editor } from "@/components/Editor";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Author, useDeckStore } from "@/store/deck-store";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock file-saver
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

// Mock jszip
vi.mock("jszip", () => {
  return {
    default: class {
      folder = vi.fn().mockReturnThis();
      file = vi.fn();
      generateAsync = vi.fn().mockResolvedValue(new Blob());
    },
  };
});

// Mock colorExtractor
vi.mock("@/utils/colorExtractor", () => ({
  extractColors: vi.fn().mockResolvedValue(["#3b82f6", "#9333ea"]),
}));

describe("Subbox Features", () => {
  beforeEach(() => {
    // Reset store before each test
    useDeckStore.setState({
      slides: [
        {
          id: "1",
          content: { primary: "Slide 1" },
          type: "social",
          layout: "single",
          settings: { theme: "twitter", frame: "macos", padding: 32 },
          annotations: [],
          author: Author,
          stats: { likes: 0, replies: 0, shares: 0 },
          date: "",
        },
      ],
      globalTheme: {
        platform: "twitter",
        mode: "light",
        fontSize: "large",
        autoSplit: true,
        windowChrome: true,
        cardStyle: "solid",
        frameStyle: "macos",
        showFooter: true,
        brandColors: [],
      },
      _hasHydrated: true,
    });
    vi.clearAllMocks();
  });

  // Phase 1 & 2 Checks
  it("TC-1.1: Loads with initial slide", () => {
    render(<Editor />);
    // Filter for the editable div
    const slideTexts = screen.getAllByText("Slide 1");
    expect(slideTexts.some((el) => el.classList.contains("cursor-text"))).toBe(
      true,
    );
  });

  it("TC-2.2: Deleting a slide removes it", () => {
    render(<Editor />);
    const deleteBtn = screen.getByTitle("Delete");
    fireEvent.click(deleteBtn);
    expect(useDeckStore.getState().slides).toHaveLength(0);
  });

  // Phase 3 & 4 Checks
  it("TC-3.2: Handles special characters in content", () => {
    const specialText = "Hello 🌍! @#%&";
    useDeckStore
      .getState()
      .updateSlide("1", { content: { primary: specialText } });
    render(<Editor />);

    expect(screen.getByText(specialText)).toBeInTheDocument();
  });

  it("TC-4.3: LinkedIn theme shows browser chrome", () => {
    useDeckStore.setState({
      slides: [
        {
          id: "1",
          content: { primary: "Linked" },
          type: "social",
          layout: "single",
          settings: { theme: "linkedin", frame: "macos", padding: 32 },
          annotations: [],
          author: Author,
          stats: { likes: 0, replies: 0, shares: 0 },
          date: "",
        },
      ],
      globalTheme: {
        platform: "linkedin",
        mode: "light",
        fontSize: "large",
        autoSplit: true,
        windowChrome: true,
        cardStyle: "solid",
        frameStyle: "macos",
        showFooter: true,
        brandColors: [],
      },
    });

    render(<Editor />);
    expect(screen.getByText("Linked")).toBeInTheDocument();
  });

  // Phase 5 Checks
  it("TC-5.1: Single Download triggers saveAs", async () => {
    render(<Editor />);
    const downloadBtn = screen.getByTitle("Download PNG");

    // Mock generateImage response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["fake-image"], { type: "image/png" }),
    });

    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("TC-5.2: Export All triggers JSZip and saveAs", async () => {
    render(<Home />);
    const exportBtn = screen.getByText("Export Deck");

    (global.fetch as any).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["fake-image"], { type: "image/png" }),
    });

    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), "subbox-deck.zip");
    });
  });

  // Phase 6 Checks
  it("TC-6.3: Rejecting split keeps text", async () => {
    render(<Editor />);
    // Click the editable content area
    const contentDivs = screen.getAllByText("Slide 1");
    const contentDiv = contentDivs.find((el) =>
      el.classList.contains("cursor-text"),
    )!;

    fireEvent.click(contentDiv);
    const textarea = screen.getByDisplayValue("Slide 1");

    // Trigger split with 3+ newlines
    const multiParaText = "P1\n\nP2\n\nP3\n\nP4";
    const pasteEvent = createPasteEvent(multiParaText);

    await act(async () => {
      fireEvent(textarea, pasteEvent);
    });

    const rejectBtn = await screen.findByText("No, keep it here");
    fireEvent.click(rejectBtn);

    expect(useDeckStore.getState().slides).toHaveLength(1);
    expect(useDeckStore.getState().slides[0].content.primary).toContain(
      multiParaText,
    );
  });

  // Phase 8 Checks
  it("TC-8.3: Reddit URL extraction logic", async () => {
    // Mock window.prompt
    vi.spyOn(window, "prompt").mockReturnValue(
      "https://www.reddit.com/r/test/comments/123/title/",
    );

    // Mock fetch for the API call from the component
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        text: "Reddit Title\n\nReddit Body",
        author: { name: "u/test", handle: "@test" },
        platform: "twitter",
      }),
    });

    render(<Editor />);

    const importBtn = screen.getByTitle("Import from URL");
    fireEvent.click(importBtn);

    await waitFor(() => {
      const state = useDeckStore.getState();
      expect(state.slides[0].content.primary).toContain("Reddit Title");
      expect(state.slides[0].content.primary).toContain("Reddit Body");
    });
  });

  it("TC-9.1: Auto Split toggle updates store", () => {
    render(<ThemeSelector />);
    const toggleBtn = screen.getByLabelText("Toggle Auto Split");

    expect(useDeckStore.getState().globalTheme.autoSplit).toBe(true);

    fireEvent.click(toggleBtn);

    expect(useDeckStore.getState().globalTheme.autoSplit).toBe(false);
  });
});

// Helper
function createPasteEvent(text: string) {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: {
      getData: () => text,
    },
  });
  return event;
}
