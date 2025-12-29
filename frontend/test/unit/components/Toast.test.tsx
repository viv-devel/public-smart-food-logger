import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ToastProvider, useToast } from "@/components/Toast";

// Mock framer-motion components
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    motion: {
      div: ({ children, className, ...props }: any) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),
    },
  };
});

// Test component to trigger toast
const TestComponent = ({
  type = "success",
}: {
  type?: "success" | "error" | "info";
}) => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Test Message", type)}>Show Toast</button>
  );
};

// Component to trigger multiple toasts
const MultiToastComponent = () => {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("First Toast", "success")}>First</button>
      <button onClick={() => showToast("Second Toast", "info")}>Second</button>
    </div>
  );
};

describe("Toast Component", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders success toast correctly", async () => {
    render(
      <ToastProvider>
        <TestComponent type="success" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    const toast = await screen.findByText("Test Message");
    expect(toast).toBeDefined();

    // Check for success styling (green implementation)
    // Note: class check depends on implementation details, but ensures branch coverage
    const toastContainer = toast.closest("div");
    expect(toastContainer?.className).toContain("bg-green-600");
  });

  it("renders error toast correctly", async () => {
    render(
      <ToastProvider>
        <TestComponent type="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    const toast = await screen.findByText("Test Message");
    expect(toast).toBeDefined();

    const toastContainer = toast.closest("div");
    expect(toastContainer?.className).toContain("bg-red-600");
  });

  it("renders info toast correctly", async () => {
    render(
      <ToastProvider>
        <TestComponent type="info" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    const toast = await screen.findByText("Test Message");
    expect(toast).toBeDefined();

    const toastContainer = toast.closest("div");
    expect(toastContainer?.className).toContain("bg-blue-600");
  });

  it("removes toast when close button is clicked", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    await screen.findByText("Test Message");

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    await act(async () => {});
    expect(screen.queryByText("Test Message")).toBeNull();
  });

  it("auto-dismisses toast after 5 seconds", async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    // With fake timers, we should assert immediately or manually advance if waiting is needed.
    // Since state update is triggered by click (inside act), it should be visible.
    expect(screen.getByText("Test Message")).toBeDefined();

    // Advance timer by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Validating removal
    expect(screen.queryByText("Test Message")).toBeNull();
  });

  it("renders multiple toasts", async () => {
    render(
      <ToastProvider>
        <MultiToastComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("First"));
    fireEvent.click(screen.getByText("Second"));

    expect(await screen.findByText("First Toast")).toBeDefined();
    expect(await screen.findByText("Second Toast")).toBeDefined();
  });

  it("throws error when useToast is used outside ToastProvider", () => {
    // Suppress console.error for this test to avoid noise
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useToast must be used within a ToastProvider");

    consoleSpy.mockRestore();
  });
});
