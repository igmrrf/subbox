import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Editor } from "@/components/Editor";
import { Author, useDeckStore } from "@/store/deck-store";

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Editor Component", () => {
  it("renders slides from store", () => {
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
        {
          id: "2",
          content: { primary: "Slide 2" },
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
        frameStyle: "macos",
        autoSplit: true,
        showFooter: true,
        brandColors: [],
      },
    });

    render(<Editor />);

    const allSlide1 = screen.getAllByText("Slide 1");
    expect(allSlide1.some((el) => el.classList.contains("cursor-text"))).toBe(
      true,
    );

    const allSlide2 = screen.getAllByText("Slide 2");
    expect(allSlide2.some((el) => el.classList.contains("cursor-text"))).toBe(
      true,
    );
  });

  it("updates slide content on textarea change", async () => {
    useDeckStore.setState({
      slides: [
        {
          id: "1",
          content: { primary: "" },
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
        frameStyle: "macos",
        autoSplit: true,
        showFooter: true,
        brandColors: [],
      },
    });

    render(<Editor />);

    // Click the empty content area to show textarea
    const contentDiv = screen.getByText("Start typing...");
    fireEvent.click(contentDiv);

    const textarea = screen.getByPlaceholderText("Start typing...");
    fireEvent.change(textarea, { target: { value: "New text" } });

    const slide = useDeckStore.getState().slides[0];
    expect(slide.content.primary).toBe("New text");
  });
});
