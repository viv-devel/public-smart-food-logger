import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { oauthHandler } from "../src/handlers/oauth.js";
import { exchangeCodeForTokens } from "../src/services/fitbitService.js";
import { Request, Response } from "express";

// Mock dependencies
vi.mock("../src/services/fitbitService.js", () => ({
  exchangeCodeForTokens: vi.fn(),
}));

// Create mocks for Request and Response
const mockReq = (method = "GET", query = {}) => {
  const req: Partial<Request> = {
    method,
    query,
  };
  return req as Request;
};

const mockRes = () => {
  const res: Partial<Response> = {};
  res.set = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("oauthHandler", () => {
  let req: Request;
  let res: Response;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.FITBIT_CLIENT_ID = "test-client-id";
    process.env.FITBIT_CLIENT_SECRET = "test-client-secret";
    process.env.OAUTH_FITBIT_REDIRECT_URI = "http://localhost:3000/callback";

    // Set default allowed origins for tests
    process.env.ALLOWED_REDIRECT_ORIGINS =
      "https://valid-app.com;https://another-valid.com";
    process.env.ALLOWED_REDIRECT_PATTERN =
      "^https:\\/\\/deploy-preview-[0-9]+--valid-app\\.netlify\\.app$";

    req = mockReq();
    res = mockRes();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should handle OPTIONS request (CORS preflight)", async () => {
    req = mockReq("OPTIONS");
    await oauthHandler(req, res);
    expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith("");
  });

  it("should throw error if OAUTH_FITBIT_REDIRECT_URI is missing", async () => {
    delete process.env.OAUTH_FITBIT_REDIRECT_URI;
    await oauthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "OAUTH_FITBIT_REDIRECT_URI 環境変数が設定されていません。",
      }),
    );
  });

  it("should throw error if FITBIT_CLIENT_ID or SECRET is missing", async () => {
    delete process.env.FITBIT_CLIENT_ID;
    await oauthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error:
          "FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET environment variables must be set",
      }),
    );
  });

  it("should return 400 if state parameter is missing", async () => {
    req.query = { code: "valid-code" }; // missing state
    await oauthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid request: state parameter is missing.",
      }),
    );
  });

  it("should return 400 if state parameter is invalid base64/json", async () => {
    req.query = { code: "valid-code", state: "invalid-base64" };
    await oauthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Invalid state: could not decode"),
      }),
    );
  });

  it("should return 400 if firebaseUid is missing in state", async () => {
    const state = Buffer.from(JSON.stringify({ redirectUri: "foo" })).toString(
      "base64",
    );
    req.query = { code: "valid-code", state };
    await oauthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid state: Firebase UID is missing.",
      }),
    );
  });

  it("should successfully exchange code and redirect to valid URI", async () => {
    const validUri = "https://valid-app.com/callback";
    const firebaseUid = "test-uid";
    const state = Buffer.from(
      JSON.stringify({ firebaseUid, redirectUri: validUri }),
    ).toString("base64");
    req.query = { code: "valid-code", state };

    await oauthHandler(req, res);

    expect(exchangeCodeForTokens).toHaveBeenCalledWith(
      "test-client-id",
      "test-client-secret",
      "valid-code",
      firebaseUid,
    );
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining(validUri),
    );
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining(`uid=${firebaseUid}`),
    );
  });

  it("should return 200 text response if redirectUri is missing in state (Success case)", async () => {
    const firebaseUid = "test-uid";
    const state = Buffer.from(JSON.stringify({ firebaseUid })).toString(
      "base64",
    );
    req.query = { code: "valid-code", state };

    await oauthHandler(req, res);

    expect(exchangeCodeForTokens).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining(
        `Authorization successful! User UID: ${firebaseUid}`,
      ),
    );
  });

  it("should return 400 if redirectUri is invalid", async () => {
    const invalidUri = "http://evil.com";
    const state = Buffer.from(
      JSON.stringify({ firebaseUid: "test-uid", redirectUri: invalidUri }),
    ).toString("base64");
    req.query = { code: "valid-code", state };

    await oauthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid redirect URI." }),
    );
  });

  it("should return 405 Method Not Allowed for non-GET/OPTIONS requests", async () => {
    req = mockReq("POST");
    await oauthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("should handle Unauthorized errors from exchangeCodeForTokens", async () => {
    const state = Buffer.from(
      JSON.stringify({ firebaseUid: "test-uid" }),
    ).toString("base64");
    req.query = { code: "valid-code", state };

    (exchangeCodeForTokens as any).mockRejectedValue(
      new Error("Unauthorized access"),
    );

    await oauthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized access" });
  });

  it("should handle arbitrary errors as 500", async () => {
    const state = Buffer.from(
      JSON.stringify({ firebaseUid: "test-uid" }),
    ).toString("base64");
    req.query = { code: "valid-code", state };

    (exchangeCodeForTokens as any).mockRejectedValue(
      new Error("Unknown error"),
    );

    await oauthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Unknown error" });
  });
});
