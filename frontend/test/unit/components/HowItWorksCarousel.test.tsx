import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HowItWorksCarousel from "@/components/HowItWorksCarousel";

// Mock framer-motion components since they use animation logic that is hard to test in jsdom
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      onDragEnd,
      drag,
      dragConstraints,
      dragElastic,
      layoutId,
      whileTap,
      initial,
      animate,
      exit,
      variants,
      transition,
      custom,
      ...props
    }: any) => {
      // Mock drag handling if needed
      return (
        <div className={className} data-testid="motion-div" {...props}>
          {children}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ fill, ...props }: any) => <img {...props} alt={props.alt} />,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ZoomIn: () => <svg data-testid="zoom-in-icon" />,
}));

describe("HowItWorksCarousel", () => {
  it("renders the initial step correctly", () => {
    render(<HowItWorksCarousel />);

    // Check Title
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();
    // Check Description - Match full text content to ensure readability and structure
    const descElement = screen.getByText(/写真を渡すだけでなく/).closest("p");
    expect(descElement?.textContent).toBe(
      "写真を渡すだけでなく、「今日のお昼はペペロンチーノとサラダ」のように文章で伝えてもAIが栄養素を推定します。",
    );

    // Check Image
    const img = screen.getByAltText("AIに食事を伝える");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("/images/1-photo-analysis.webp");
  });

  it("renders pagination indicators", () => {
    render(<HowItWorksCarousel />);
    // Should have 3 buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("changes step when pagination button is clicked", () => {
    render(<HowItWorksCarousel />);

    const buttons = screen.getAllByRole("button");
    // Click 2nd button (index 1)
    fireEvent.click(buttons[1]);

    // Should now show 2nd step
    expect(screen.getByText("JSONを貼り付けて記録")).toBeDefined();

    const descElement = screen
      .getByText(/カスタムGeminiが生成した栄養情報/)
      .closest("p");
    expect(descElement?.textContent).toBe(
      "カスタムGeminiが生成した栄養情報（JSON）をフォームに貼り付け、ボタンを押すだけ。手間なく正確な記録が可能です。",
    );

    const img = screen.getByAltText("JSONを貼り付けて記録");
    expect(img.getAttribute("src")).toBe("/images/2-json-copy.webp");
  });

  it("cycles through steps", () => {
    render(<HowItWorksCarousel />);

    const buttons = screen.getAllByRole("button");

    // Step 1 -> Step 3
    fireEvent.click(buttons[2]);
    expect(screen.getByText("Fitbitで栄養をチェック")).toBeDefined();

    const descElement = screen
      .getByText(/記録された食事はFitbitアプリで/)
      .closest("p");
    expect(descElement?.textContent).toBe(
      "記録された食事はFitbitアプリで消費カロリーと比較して確認できます。Fitbit WatchやPixel Watchユーザーに最適です。",
    );

    // Step 3 -> Step 1
    fireEvent.click(buttons[0]);
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();
  });

  it("opens and closes the lightbox modal", () => {
    render(<HowItWorksCarousel />);

    // Initial state: Modal should not be visible
    // We can't easily check for "not visible" if it's not in DOM, but we can query by a unique characteristic of the modal
    // The modal has fixed inset-0 z-50
    // Or we can check if there are 2 images (one in carousel, one in modal)
    const imagesBefore = screen.getAllByAltText("AIに食事を伝える");
    expect(imagesBefore).toHaveLength(1);

    // Find the wrapper with cursor-zoom-in or just click the image wrapper
    // The image wrapper in our component has onClick. In the mock, the wrapper (motion.div) gets the onClick.
    const imageWrapper = imagesBefore[0].closest("div[data-testid='motion-div']");
    expect(imageWrapper).toBeDefined();

    // Click to zoom
    if (imageWrapper) {
      fireEvent.click(imageWrapper);
    }

    // Now modal should be open. There should be 2 images with the same alt text.
    const imagesAfter = screen.getAllByAltText("AIに食事を伝える");
    expect(imagesAfter).toHaveLength(2);

    // Verify modal overlay exists (it has fixed inset-0)
    // We can find it by className or hierarchy. The overlay has `fixed inset-0 ...`
    // In our mock, it's just a div.
    // The overlay is the parent of the second image's container.
    // Let's find the overlay by clicking "somewhere" that is not the image.
    // The overlay div has onClick={() => setIsZoomed(false)}.
    // The inner container has onClick stopPropagation.

    // Let's find the overlay. It's the parent of the container of the second image.
    const modalImage = imagesAfter[1];
    const modalContainer = modalImage.closest("div[data-testid='motion-div']");
    const modalOverlay = modalContainer?.parentElement;

    expect(modalOverlay).toBeDefined();

    // Click overlay to close
    if (modalOverlay) {
        fireEvent.click(modalOverlay);
    }

    // Should be back to 1 image
    const imagesFinal = screen.getAllByAltText("AIに食事を伝える");
    expect(imagesFinal).toHaveLength(1);
  });
});
