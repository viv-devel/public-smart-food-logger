import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { recaptchaVerifier, verifyRecaptcha, RECAPTCHA_THRESHOLDS } from "../src/recaptcha";
import { Request, Response } from "express";
import fetch from "node-fetch";

// Mock node-fetch
vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("Recaptcha Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const originalEnv = process.env;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      set: vi.fn(),
      send: vi.fn(),
    };
    process.env = { ...originalEnv };
    // Set a dummy secret for tests to avoid the missing secret error in standard tests
    process.env.RECAPTCHA_V3_SECRET_KEY = "dummy_secret_key";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // --- Utility Tests (verifyRecaptcha) ---
  describe("verifyRecaptcha (Utility)", () => {
    it("should throw Error if RECAPTCHA_V3_SECRET_KEY is missing (Fail Closed)", async () => {
      delete process.env.RECAPTCHA_V3_SECRET_KEY;
      await expect(verifyRecaptcha("token", "TEST", 0.5)).rejects.toThrow(
        "RECAPTCHA_V3_SECRET_KEY is not set",
      );
    });

    it("should return true and log error on network exception (Fail Open)", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

      const result = await verifyRecaptcha("token", "TEST", 0.5);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"result":"error_skipped"'),
      );
      consoleSpy.mockRestore();
    });

    it("should return false if API returns success: false", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ success: false, "error-codes": ["invalid-input"] }),
      } as any);

      const result = await verifyRecaptcha("token", "TEST", 0.5);
      expect(result).toBe(false);
    });

    it("should return false if action mismatch", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ success: true, action: "OTHER_ACTION", score: 0.9 }),
      } as any);

      const result = await verifyRecaptcha("token", "TEST", 0.5);
      expect(result).toBe(false);
    });

    it("should return false if score too low", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ success: true, action: "TEST", score: 0.1 }),
      } as any);

      const result = await verifyRecaptcha("token", "TEST", 0.5);
      expect(result).toBe(false);
    });

    it("should return true if valid", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ success: true, action: "TEST", score: 0.9 }),
      } as any);

      const result = await verifyRecaptcha("token", "TEST", 0.5);
      expect(result).toBe(true);
    });
  });

  // --- HttpFunction Tests (recaptchaVerifier) ---
  describe("recaptchaVerifier (HttpFunction)", () => {
    it("should set CORS headers", async () => {
      req.method = "OPTIONS";
      await recaptchaVerifier(req as Request, res as Response);

      expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
      expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Methods", "POST, OPTIONS");
      expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Content-Type");
      expect(res.set).toHaveBeenCalledWith("Access-Control-Max-Age", "3600");
    });

    it("should handle OPTIONS request with 204", async () => {
      req.method = "OPTIONS";
      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith("");
    });

    it("should reject non-POST requests with 405", async () => {
      req.method = "GET";
      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.send).toHaveBeenCalledWith("Method Not Allowed");
    });

    it("should return 400 if token is missing", async () => {
      req.method = "POST";
      req.body = {}; // No token

      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "reCAPTCHA token missing" });
    });

    it("should verify successfully with valid token and action", async () => {
      req.method = "POST";
      req.body = { token: "valid_token", action: "AUTHENTICATE" };

      // Mock successful verification
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({
          success: true,
          action: "AUTHENTICATE",
          score: 0.9 // > 0.3 threshold
        }),
      } as any);

      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should use default threshold if action is missing/unknown", async () => {
      req.method = "POST";
      req.body = { token: "valid_token" }; // No action

      // Mock successful verification with low score but above default threshold?
      // Default is 0.3.
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({
          success: true,
          action: "",
          score: 0.4 // > 0.3
        }),
      } as any);

      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return success: false if verification fails", async () => {
      req.method = "POST";
      req.body = { token: "bad_token", action: "AUTHENTICATE" };

      // Mock failure
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({
          success: false,
          "error-codes": ["invalid-input-response"]
        }),
      } as any);

      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200); // Status 200, but body success: false
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });

    it("should return 500 if an internal error occurs (e.g. missing secret)", async () => {
      req.method = "POST";
      req.body = { token: "token", action: "AUTHENTICATE" };

      // Force verifyRecaptcha to throw by removing secret
      delete process.env.RECAPTCHA_V3_SECRET_KEY;

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await recaptchaVerifier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Verification failed" });

      consoleSpy.mockRestore();
    });
  });
});
