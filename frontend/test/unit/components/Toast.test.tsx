import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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
const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Test Message", "success")}>
      Show Toast
    </button>
  );
};

describe("Toast Component", () => {
  it("renders toast when showToast is called", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText("Show Toast");
    fireEvent.click(button);

    // Wait for the toast to appear
    const toastMessage = await screen.findByText("Test Message");
    expect(toastMessage).toBeDefined();
  });

  it("removes toast when close button is clicked", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Show Toast"));
    const toastMessage = await screen.findByText("Test Message");
    expect(toastMessage).toBeDefined();

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    // Since we mocked AnimatePresence, removal should be instant or on next render
    // We can use waitForElementToBeRemoved but sometimes it's tricky with mocks
    // Let's just check if it's gone
    // We need to wait a tick because state update is async
    await act(async () => {});

    expect(screen.queryByText("Test Message")).toBeNull();
  });
});
