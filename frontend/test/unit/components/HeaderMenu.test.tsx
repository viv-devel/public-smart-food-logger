import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HeaderMenu from "@/components/HeaderMenu";
import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";
import { useRouter } from "next/navigation";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

// Mocks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/app/auth/FirebaseAuthProvider", () => ({
  useFirebaseAuth: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  signOut: vi.fn(),
}));

const mockPush = vi.fn();
(useRouter as Mock).mockReturnValue({ push: mockPush });

describe("HeaderMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the menu button", () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    const button = screen.getByTestId("header-menu-button");
    expect(button).toBeDefined();
  });

  it("opens drawer when button is clicked", async () => {
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    const button = screen.getByTestId("header-menu-button");

    // Initially closed
    expect(screen.queryByText("アプリトップ")).toBeNull();

    fireEvent.click(button);

    // Check for Drawer elements
    await waitFor(() => {
      expect(screen.getByText("アプリトップ")).toBeDefined();
      // JSON登録 should be hidden when logged out
      expect(screen.queryByText("JSON登録")).toBeNull();
      expect(screen.getByText("設定手順")).toBeDefined();
      expect(screen.getByText("利用規約")).toBeDefined();
    });
  });

  it("shows restricted items only when logged in and fitbit auth completed", async () => {
    // Mock localStorage
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    // Logged in
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
    // Mock localStorage
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    // Logged out
    (useFirebaseAuth as Mock).mockReturnValue({ user: null });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      expect(screen.queryByText("JSON登録")).toBeNull();
      expect(screen.queryByText("連携解除")).toBeNull();
    });
  });

  it("handles logout confirmation", async () => {
    // Mock localStorage for auth check
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue("true");

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);

    // Mock local storage removeItem
    const localStorageSpy = vi.spyOn(Storage.prototype, "removeItem");

    (useFirebaseAuth as Mock).mockReturnValue({ user: { uid: "123" } });
    render(<HeaderMenu />);
    fireEvent.click(screen.getByTestId("header-menu-button"));

    await waitFor(() => {
      screen.getByText("連携解除");
    });

    const logoutBtn = screen.getByText("連携解除");
    fireEvent.click(logoutBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(localStorageSpy).toHaveBeenCalledWith("fitbitAuthCompleted");
    expect(localStorageSpy).toHaveBeenCalledWith("redirectRemembered");

    confirmSpy.mockRestore();
    localStorageSpy.mockRestore();
  });
});
