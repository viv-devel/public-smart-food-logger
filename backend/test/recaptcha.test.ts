import { describe, it, expect, vi, beforeEach } from "vitest";
import { withRecaptcha } from "../src/utils/withRecaptcha";
import { verifyRecaptcha } from "../src/recaptcha";
import { Request, Response } from "express";

// Mock verifyRecaptcha
vi.mock("../src/recaptcha", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/recaptcha")>();
  return {
    ...actual,
    verifyRecaptcha: vi.fn(),
  };
});

describe("withRecaptcha Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: any;
  let mockHandler: any;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockHandler = vi.fn();
    vi.clearAllMocks();
  });

  it("should bypass verification if recaptchaToken is missing (backward compatibility)", async () => {
    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = {}; // No token

    await wrappedHandler(req as Request, res as Response);

    expect(vi.mocked(verifyRecaptcha)).not.toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalled();
  });

  it("should verify token if recaptchaToken is present", async () => {
    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "valid-token" };
    vi.mocked(verifyRecaptcha).mockResolvedValue(true);

    await wrappedHandler(req as Request, res as Response);

    expect(vi.mocked(verifyRecaptcha)).toHaveBeenCalledWith(
      "valid-token",
      "WRITE_LOG",
      0.3, // Default threshold
    );
    expect(mockHandler).toHaveBeenCalled();
  });

  it("should verify token with custom environment threshold", async () => {
    process.env.RECAPTCHA_THRESHOLD_WRITE_LOG = "0.7";
    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "valid-token" };
    vi.mocked(verifyRecaptcha).mockResolvedValue(true);

    await wrappedHandler(req as Request, res as Response);

    expect(vi.mocked(verifyRecaptcha)).toHaveBeenCalledWith(
      "valid-token",
      "WRITE_LOG",
      0.7,
    );
    expect(mockHandler).toHaveBeenCalled();
    delete process.env.RECAPTCHA_THRESHOLD_WRITE_LOG;
  });

  it("should return 403 if verification fails", async () => {
    const wrappedHandler = withRecaptcha("WRITE_LOG", mockHandler);
    req.body = { recaptchaToken: "invalid-token" };
    vi.mocked(verifyRecaptcha).mockResolvedValue(false);

    await wrappedHandler(req as Request, res as Response);

    expect(vi.mocked(verifyRecaptcha)).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Forbidden") }),
    );
    expect(mockHandler).not.toHaveBeenCalled();
  });
});
