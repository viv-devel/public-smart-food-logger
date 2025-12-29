import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HeaderMenu from "@/components/HeaderMenu";
import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";
import { useRouter } from "next/navigation";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

// Mock framer-motion components
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => {
      return (
        <div
          className={className}
          data-testid="motion-div"
          onClick={onClick}
          {...props}
        >
          {children}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/app/auth/FirebaseAuthProvider", () => ({
  useFirebaseAuth: vi.fn(),
}));

// Mock firebase/auth
// Since the component uses dynamic import: const { getAuth, signOut } = await import("firebase/auth");
// We need to ensure that when it imports, it gets our mocks.
// Vitest hoisting handles top-level mocks, but for dynamic imports, we verify behavior.
const mockSignOut = vi.fn();
const mockGetAuth = vi.fn();

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    getAuth: () => mockGetAuth(),
    signOut: mockSignOut,
  };
});

const mockPush = vi.fn();
(useRouter as Mock).mockReturnValue({ push: mockPush });

describe("HeaderMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementation for signOut if needed, but vi.clearAllMocks() clears calls.
    // If we changed return values, we reset them.
  });

  it("renders the menu button", () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    const button = screen.getByTestId("header-menu-button");
    expect(button).toBeDefined();
  });

  it("opens drawer when button is clicked and shows basic links", async () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    const button = screen.getByTestId("header-menu-button");

    expect(screen.queryByText("アプリトップ")).toBeNull();

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("アプリトップ")).toBeDefined();
      expect(screen.getByText("設定手順")).toBeDefined();
      expect(screen.getByText("利用規約")).toBeDefined();
      expect(screen.queryByText("JSON登録")).toBeNull();
    });
  });

  it("shows restricted items only when logged in and fitbit auth completed", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    (useFirebaseAuth as Mock).mockReturnValue({ user: { uid: "123" } });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.getByText("JSON登録")).toBeDefined();
      expect(screen.getByText("連携解除")).toBeDefined();
    });

    getItemSpy.mockRestore();
  });

  it("does not show restricted items when logged out", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.queryByText("JSON登録")).toBeNull();
      expect(screen.queryByText("連携解除")).toBeNull();
    });
  });

  it("does not show restricted items when logged in but fitbit auth NOT completed", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue(null);

    (useFirebaseAuth as Mock).mockReturnValue({ user: { uid: "123" } });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.queryByText("JSON登録")).toBeNull();
      expect(screen.queryByText("連携解除")).toBeNull();
    });

    getItemSpy.mockRestore();
  });

  it("handles logout confirmation and cleanup", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);

    const localStorageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");

    (useFirebaseAuth as Mock).mockReturnValue({ user: { uid: "123" } });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      screen.getByText("連携解除");
    });

    const logoutBtn = screen.getByText("連携解除");
    fireEvent.click(logoutBtn);

    // Wait for async logout process
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(
        "Fitbit連携を解除してログアウトしますか？",
      );
      expect(localStorageRemoveSpy).toHaveBeenCalledWith("fitbitAuthCompleted");
      expect(localStorageRemoveSpy).toHaveBeenCalledWith("redirectRemembered");
      expect(mockSignOut).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
    localStorageRemoveSpy.mockRestore();
  });

  it("handles logout cancellation", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => false);

    (useFirebaseAuth as Mock).mockReturnValue({ user: { uid: "123" } });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      screen.getByText("連携解除");
    });

    fireEvent.click(screen.getByText("連携解除"));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  it("handles logout error", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);

    const alertSpy = vi.spyOn(window, "alert");
    alertSpy.mockImplementation(() => {});

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockSignOut.mockRejectedValue(new Error("SignOut Failed"));

    (useFirebaseAuth as Mock).mockReturnValue({ user: { uid: "123" } });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      screen.getByText("連携解除");
    });

    fireEvent.click(screen.getByText("連携解除"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "ログアウトエラー:",
        expect.any(Error),
      );
      expect(alertSpy).toHaveBeenCalledWith("ログアウトに失敗しました");
    });

    confirmSpy.mockRestore();
    getItemSpy.mockRestore();
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("closes menu when clicking overlay", async () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.getByTestId("header-menu-overlay")).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("header-menu-overlay"));

    await waitFor(() => {
      expect(screen.queryByText("アプリトップ")).toBeNull();
    });
  });

  it("closes menu when clicking a link", async () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.getByText("アプリトップ")).toBeDefined();
    });

    fireEvent.click(screen.getByText("アプリトップ"));

    await waitFor(() => {
      expect(screen.queryByText("アプリトップ")).toBeNull();
    });
  });

  it("closes menu when clicking close button", async () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.getByLabelText("閉じる")).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText("閉じる"));

    await waitFor(() => {
      expect(screen.queryByText("アプリトップ")).toBeNull();
    });
  });

  it("closes menu when clicking other links (Instructions, Tips, Terms, Privacy)", async () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);

    const links = [
      "設定手順",
      "使い方のヒント",
      "利用規約",
      "プライバシーポリシー",
    ];

    for (const linkText of links) {
      // Open menu
      fireEvent.click(screen.getByTestId("header-menu-button"));
      await waitFor(() => {
        expect(screen.getByText(linkText)).toBeDefined();
      });

      // Click link
      fireEvent.click(screen.getByText(linkText));

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText(linkText)).toBeNull();
      });
    }
  });
});
