import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRecaptcha } from "@/hooks/useRecaptcha";

// useRecaptchaはフックなので、テスト環境で実行するためのラッパーが必要
// ただし、単純な関数ロジックのテストなので、フックそのものをモックするか、
// コンポーネント経由でテストするのが一般的だが、今回はロジックが単純なので
// フックの戻り値を直接テストしたい。
// React 19 / Vitest環境では `renderHook` は `@testing-library/react` から提供される。
import { renderHook } from "@testing-library/react";

describe("useRecaptcha Hook", () => {
  const mockExecute = vi.fn();
  const mockReady = vi.fn((cb) => cb());

  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY = "test-site-key";
    process.env.NEXT_PUBLIC_RECAPTCHA_BACKEND_URL =
      "http://test-backend/recaptchaVerifier";

    // Mock window.grecaptcha
    window.grecaptcha = {
      ready: mockReady,
      execute: mockExecute,
    };

    // Mock global fetch
    global.fetch = vi.fn();

    // Clear mocks
    mockExecute.mockClear();
    mockReady.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    delete (window as any).grecaptcha;
  });

  describe("executeRecaptcha", () => {
    it("should successfully execute recaptcha and return token", async () => {
      mockExecute.mockResolvedValue("test-token");

      const { result } = renderHook(() => useRecaptcha());

      const token = await result.current.executeRecaptcha("test_action");

      expect(mockReady).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalledWith("test-site-key", {
        action: "test_action",
      });
      expect(token).toBe("test-token");
    });

    it("should throw error if site key is missing", async () => {
      process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY = "";

      const { result } = renderHook(() => useRecaptcha());

      await expect(result.current.executeRecaptcha("test")).rejects.toThrow(
        "reCAPTCHA site key is not configured",
      );
    });

    it("should throw error if grecaptcha script is not loaded", async () => {
      delete (window as any).grecaptcha;

      const { result } = renderHook(() => useRecaptcha());

      await expect(result.current.executeRecaptcha("test")).rejects.toThrow(
        "reCAPTCHA script not loaded",
      );
    });

    it("should propagate execution errors", async () => {
      mockExecute.mockRejectedValue(new Error("Google API Error"));

      const { result } = renderHook(() => useRecaptcha());

      await expect(result.current.executeRecaptcha("test")).rejects.toThrow(
        "Google API Error",
      );
    });
  });

  describe("verifyWithBackend", () => {
    it("should return true when backend verification succeeds", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useRecaptcha());

      const isValid = await result.current.verifyWithBackend(
        "token123",
        "action_abc",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-backend/recaptchaVerifier",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ token: "token123", action: "action_abc" }),
        }),
      );
      expect(isValid).toBe(true);
    });

    it("should return false when backend verification fails (logic false)", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: false }),
      });

      const { result } = renderHook(() => useRecaptcha());

      const isValid = await result.current.verifyWithBackend(
        "token123",
        "action_abc",
      );

      expect(isValid).toBe(false);
    });

    it("should return false when backend returns non-ok status", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useRecaptcha());

      const isValid = await result.current.verifyWithBackend(
        "token123",
        "action_abc",
      );

      expect(isValid).toBe(false);
    });

    it("should return false when fetch throws error", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network Error"));

      const { result } = renderHook(() => useRecaptcha());

      const isValid = await result.current.verifyWithBackend(
        "token123",
        "action_abc",
      );

      expect(isValid).toBe(false);
    });

    it("should return false if backend URL is missing", async () => {
      process.env.NEXT_PUBLIC_RECAPTCHA_BACKEND_URL = "";

      const { result } = renderHook(() => useRecaptcha());

      const isValid = await result.current.verifyWithBackend("token", "action");

      expect(isValid).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
