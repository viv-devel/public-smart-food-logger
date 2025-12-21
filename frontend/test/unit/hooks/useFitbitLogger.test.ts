import { act, renderHook, waitFor } from "@testing-library/react";
import { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logToFitbit } from "@/app/actions/fitbitLog";
import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";
import { useFitbitLogger } from "@/hooks/useFitbitLogger";

// Mock dependencies
vi.mock("@/app/actions/fitbitLog", () => ({
  logToFitbit: vi.fn(),
}));

vi.mock("@/app/auth/FirebaseAuthProvider", () => ({
  useFirebaseAuth: vi.fn(),
}));

describe("useFitbitLogger", () => {
  const mockLogToFitbit = logToFitbit as unknown as ReturnType<typeof vi.fn>;
  const mockUseFirebaseAuth = useFirebaseAuth as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockPreventDefault = vi.fn();

  // Mock FormEvent
  const mockEvent = {
    preventDefault: mockPreventDefault,
  } as unknown as FormEvent<HTMLFormElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Authenticated user
    mockUseFirebaseAuth.mockReturnValue({ idToken: "test-token" });
    // Default: Console error mock to suppress output during error tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useFitbitLogger());

    expect(result.current.jsonInput).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.statusMessage).toBe("");
    expect(result.current.isError).toBe(false);
    expect(result.current.registeredFoods).toEqual([]);
  });

  it("should handle state updates", () => {
    const { result } = renderHook(() => useFitbitLogger());

    act(() => {
      result.current.setJsonInput("test");
    });
    expect(result.current.jsonInput).toBe("test");

    act(() => {
      result.current.setStatusMessage("status");
    });
    expect(result.current.statusMessage).toBe("status");

    act(() => {
      result.current.setIsError(true);
    });
    expect(result.current.isError).toBe(true);
  });

  it("should show error if idToken is missing", async () => {
    mockUseFirebaseAuth.mockReturnValue({ idToken: null });
    const { result } = renderHook(() => useFitbitLogger());

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(result.current.isError).toBe(true);
    expect(result.current.statusMessage).toContain(
      "認証トークンが取得できません",
    );
    expect(mockLogToFitbit).not.toHaveBeenCalled();
  });

  it("should show error for invalid JSON", async () => {
    const { result } = renderHook(() => useFitbitLogger());

    act(() => {
      result.current.setJsonInput("{ invalid json }");
    });

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.statusMessage).toContain("JSONの形式が正しくありません");
    expect(console.error).toHaveBeenCalled();
    expect(mockLogToFitbit).not.toHaveBeenCalled();
  });

  it("should handle successful submission", async () => {
    const validJson = JSON.stringify({
      foods: [{ foodName: "Apple" }, { foodName: "Banana" }],
    });
    mockLogToFitbit.mockResolvedValue({
      success: true,
      message: "Log successful",
    });

    const { result } = renderHook(() => useFitbitLogger());

    act(() => {
      result.current.setJsonInput(validJson);
    });

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.statusMessage).toBe("Log successful");
    expect(result.current.registeredFoods).toEqual(["Apple", "Banana"]);
    expect(mockLogToFitbit).toHaveBeenCalledWith(
      JSON.parse(validJson),
      "test-token",
    );
  });

  it("should handle failed submission from API", async () => {
    const validJson = JSON.stringify({ foods: [] });
    mockLogToFitbit.mockResolvedValue({
      success: false,
      message: "API Error",
    });

    const { result } = renderHook(() => useFitbitLogger());

    act(() => {
      result.current.setJsonInput(validJson);
    });

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.statusMessage).toBe("API Error");
    expect(result.current.registeredFoods).toEqual([]);
  });

  it("should handle unexpected errors during submission", async () => {
    const validJson = JSON.stringify({ foods: [] });
    mockLogToFitbit.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useFitbitLogger());

    act(() => {
      result.current.setJsonInput(validJson);
    });

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.statusMessage).toBe("Network Error");
    expect(console.error).toHaveBeenCalled();
  });

  it("should reset state correctly", () => {
    const { result } = renderHook(() => useFitbitLogger());

    // Set some state
    act(() => {
      result.current.setJsonInput("some input");
      result.current.setIsError(true);
      result.current.setStatusMessage("Error");
    });

    // Reset
    act(() => {
      result.current.resetState();
    });

    expect(result.current.jsonInput).toBe("");
    expect(result.current.statusMessage).toBe("");
    expect(result.current.isError).toBe(false);
    expect(result.current.registeredFoods).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
