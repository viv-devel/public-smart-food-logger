import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import HowItWorksCarousel from "@/components/HowItWorksCarousel";

// Mock framer-motion components
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      onDragEnd,
      onClick,
      onTap,
      whileTap,
      drag,
      dragConstraints,
      dragElastic,
      ...props
    }: any) => {
      // Map onTap to onClick for testing
      const handleClick = (e: any) => {
        if (onClick) onClick(e);
        if (onTap) onTap(e, {});
      };

      return (
        <div
          className={className}
          data-testid="motion-div"
          onClick={handleClick}
          {...props}
        >
          {children}
          {onDragEnd && (
            <button
              data-testid="trigger-drag-right"
              onClick={() =>
                onDragEnd(null, {
                  offset: { x: 100, y: 0 },
                  velocity: { x: 200, y: 0 },
                })
              }
            />
          )}
          {onDragEnd && (
            <button
              data-testid="trigger-drag-left"
              onClick={() =>
                onDragEnd(null, {
                  offset: { x: -100, y: 0 },
                  velocity: { x: -200, y: 0 },
                })
              }
            />
          )}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  PanInfo: {},
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: any) => (
    <img
      {...props}
      alt={props.alt}
      data-priority={priority ? "true" : "false"}
    />
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ZoomIn: () => <svg data-testid="zoom-in-icon" />,
}));

describe("HowItWorksCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the initial step correctly", () => {
    render(<HowItWorksCarousel />);
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();
    expect(screen.getByAltText("AIに食事を伝える")).toBeDefined();
  });

  it("auto-advances slides every 5 seconds", () => {
    render(<HowItWorksCarousel />);

    // Initial state: Step 1
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should be Step 2
    expect(screen.getByText("JSONを貼り付けて記録")).toBeDefined();

    // Advance another 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should be Step 3
    expect(screen.getByText("Fitbitで栄養をチェック")).toBeDefined();

    // Loop back to Step 1
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();
  });

  it("pauses auto-advance when zoomed", () => {
    render(<HowItWorksCarousel />);

    // Open zoom
    const images = screen.getAllByAltText("AIに食事を伝える");
    const imageWrapper = images[0].closest("div[data-testid='motion-div']");
    if (imageWrapper) {
      fireEvent.click(imageWrapper);
    }

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should STILL be Step 1 (no change) because zoomed
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();

    // Close zoom
    const closeOverlay = screen.getAllByRole("dialog")[0]; // finding the modal
    fireEvent.click(closeOverlay); // click overlay to close

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should now be Step 2
    expect(screen.getByText("JSONを貼り付けて記録")).toBeDefined();
  });

  it("closes lightbox on Escape key", () => {
    render(<HowItWorksCarousel />);

    // Open zoom
    const images = screen.getAllByAltText("AIに食事を伝える");
    const imageWrapper = images[0].closest("div[data-testid='motion-div']");
    if (imageWrapper) {
      fireEvent.click(imageWrapper);
    }

    expect(screen.queryAllByRole("dialog")).toHaveLength(1);

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    // Modal should be gone
    expect(screen.queryAllByRole("dialog")).toHaveLength(0);
  });

  it("pagination buttons work", () => {
    render(<HowItWorksCarousel />);
    const step3Button = screen.getByLabelText("Go to step 3");
    fireEvent.click(step3Button);
    expect(screen.getByText("Fitbitで栄養をチェック")).toBeDefined();
  });

  it("handles swipes correctly", () => {
    render(<HowItWorksCarousel />);

    // Swipe Left (Next)
    const dragLeftBtn = screen.getByTestId("trigger-drag-left");
    fireEvent.click(dragLeftBtn);
    expect(screen.getByText("JSONを貼り付けて記録")).toBeDefined();

    // Swipe Right (Prev)
    const dragRightBtn = screen.getByTestId("trigger-drag-right");
    fireEvent.click(dragRightBtn);
    expect(screen.getByText("AIに食事を伝える")).toBeDefined();
  });
});
