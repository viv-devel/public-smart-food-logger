import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRecaptcha } from "../src/utils/withRecaptcha";
import { verifyRecaptcha } from "../src/recaptcha";
import { Request, Response } from "express";
import fetch from "node-fetch";

// Mock node-fetch
vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("withRecaptcha Middleware and Utility", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockHandler: any;
  const originalEnv = process.env;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockHandler = vi.fn();
    process.env = { ...originalEnv };
    // Set a dummy secret for tests to avoid the missing secret error in standard tests
    process.env.RECAPTCHA_V3_SECRET_KEY = "dummy_secret_key";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // --- Utility Tests (verifyRecaptcha) ---

  it("verifyRecaptcha should throw Error if RECAPTCHA_V3_SECRET_KEY is missing (Fail Closed)", async () => {
    delete process.env.RECAPTCHA_V3_SECRET_KEY;
    await expect(verifyRecaptcha("token", "TEST", 0.5)).rejects.toThrow(
      "RECAPTCHA_V3_SECRET_KEY is not set",
    );
  });

  it("verifyRecaptcha should return true and log error on network exception (Fail Open)", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    const result = await verifyRecaptcha("token", "TEST", 0.5);

    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"result":"error_skipped"'),
    );
    consoleSpy.mockRestore();
  });

  it("verifyRecaptcha should return false if API returns success: false", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: false, "error-codes": ["invalid-input"] }),
    } as any);

    const result = await verifyRecaptcha("token", "TEST", 0.5);
    expect(result).toBe(false);
  });

  it("verifyRecaptcha should return false if action mismatch", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, action: "OTHER_ACTION", score: 0.9 }),
    } as any);

    const result = await verifyRecaptcha("token", "TEST", 0.5);
    expect(result).toBe(false);
  });

  it("verifyRecaptcha should return false if score too low", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, action: "TEST", score: 0.1 }),
    } as any);

    const result = await verifyRecaptcha("token", "TEST", 0.5);
    expect(result).toBe(false);
  });

  it("verifyRecaptcha should return true if valid", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, action: "TEST", score: 0.9 }),
    } as any);

    const result = await verifyRecaptcha("token", "TEST", 0.5);
    expect(result).toBe(true);
  });

  // --- Middleware Tests (withRecaptcha) ---

  it("middleware should bypass verification if recaptchaToken is missing", async () => {
    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = {}; // No token

    // Even without mocking verifyRecaptcha, this should pass because it returns early
    await wrappedHandler(req as Request, res as Response);

    expect(mockHandler).toHaveBeenCalled();
  });

  it("middleware should verify token if present (Integration-like check)", async () => {
    // We mock fetch here to simulate the full flow
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({
        success: true,
        action: "WRITE_LOG",
        score: 0.9,
      }),
    } as any);

    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "valid-token" };

    await wrappedHandler(req as Request, res as Response);

    expect(fetch).toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalled();
  });

  it("middleware should return 403 if verification fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: false }),
    } as any);

    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "invalid-token" };

    await wrappedHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("middleware should enforce default constant threshold (0.3)", async () => {
    // Case 1: Score 0.2 (< 0.3) -> Should Fail
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ success: true, action: "WRITE_LOG", score: 0.2 }),
    } as any);

    const wrappedHandlerFail = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "low-score-token" };

    await wrappedHandlerFail(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockHandler).not.toHaveBeenCalled();

    // Reset mocks for success case
    vi.clearAllMocks();
    res.status = vi.fn().mockReturnThis();

    // Case 2: Score 0.4 (> 0.3) -> Should Pass
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ success: true, action: "WRITE_LOG", score: 0.4 }),
    } as any);

    const wrappedHandlerPass = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "high-score-token" };

    await wrappedHandlerPass(req as Request, res as Response);

    expect(mockHandler).toHaveBeenCalled();
  });
});
