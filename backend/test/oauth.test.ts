import { describe, it, expect, vi, beforeEach } from "vitest";
import { oauthHandler } from "../src/handlers/oauth.js";
import { exchangeCodeForTokens } from "../src/services/fitbitService.js";
import { Request, Response } from "express";

// Mock dependencies
vi.mock("../src/services/fitbitService.js", () => ({
  exchangeCodeForTokens: vi.fn(),
}));

// Create mocks for Request and Response
const mockReq = () => {
  const req: Partial<Request> = {
    method: "GET",
    query: {},
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

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.FITBIT_CLIENT_ID = "test-client-id";
    process.env.FITBIT_CLIENT_SECRET = "test-client-secret";
    process.env.OAUTH_FITBIT_REDIRECT_URI = "http://localhost:3000/callback";

    // Set default allowed origins for tests (using semicolon separator)
    process.env.ALLOWED_REDIRECT_ORIGINS = "https://valid-app.com;https://another-valid.com";
    // Regex matches the ORIGIN, so we must include the protocol and ensure exact match or proper anchoring if needed.
    // The implementation tests `regex.test(url.origin)`.
    // Example: ^https:\/\/deploy-preview-[0-9]+--valid-app\.netlify\.app$
    process.env.ALLOWED_REDIRECT_PATTERN = "^https:\\/\\/deploy-preview-[0-9]+--valid-app\\.netlify\\.app$";

    req = mockReq();
    res = mockRes();
  });

  it("should block malicious redirect URIs", async () => {
    const maliciousUri = "https://evil.com/phishing";
    const state = Buffer.from(
      JSON.stringify({
        firebaseUid: "test-uid",
        redirectUri: maliciousUri,
      })
    ).toString("base64");

    req.query = {
      code: "test-auth-code",
      state: state,
    };

    await oauthHandler(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should allow redirect URIs in the allowed origins list", async () => {
    const validUri = "https://valid-app.com/callback?foo=bar";
    const state = Buffer.from(
      JSON.stringify({
        firebaseUid: "test-uid",
        redirectUri: validUri,
      })
    ).toString("base64");

    req.query = {
      code: "test-auth-code",
      state: state,
    };

    await oauthHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(302, expect.stringContaining(validUri));
  });

  it("should allow redirect URIs matching the regex pattern", async () => {
    // Origin: https://deploy-preview-123--valid-app.netlify.app
    const validPreviewUri = "https://deploy-preview-123--valid-app.netlify.app/callback";
    const state = Buffer.from(
      JSON.stringify({
        firebaseUid: "test-uid",
        redirectUri: validPreviewUri,
      })
    ).toString("base64");

    req.query = {
      code: "test-auth-code",
      state: state,
    };

    await oauthHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(302, expect.stringContaining(validPreviewUri));
  });

  it("should block subdomain attacks that match the prefix but not the origin", async () => {
    // This looks like a valid preview URL prefix, but it's actually a subdomain of evil.com
    // Origin: https://deploy-preview-123--valid-app.netlify.app.evil.com
    const maliciousSubdomainUri = "https://deploy-preview-123--valid-app.netlify.app.evil.com/callback";
    const state = Buffer.from(
      JSON.stringify({
        firebaseUid: "test-uid",
        redirectUri: maliciousSubdomainUri,
      })
    ).toString("base64");

    req.query = {
      code: "test-auth-code",
      state: state,
    };

    await oauthHandler(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should allow localhost by default", async () => {
      const localUri = "http://localhost:3000/callback";
      const state = Buffer.from(
        JSON.stringify({
          firebaseUid: "test-uid",
          redirectUri: localUri,
        })
      ).toString("base64");

      req.query = {
        code: "test-auth-code",
        state: state,
      };

      await oauthHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith(302, expect.stringContaining(localUri));
  });

    it("should block non-https URIs (except localhost)", async () => {
    const httpUri = "http://valid-app.com/callback"; // HTTP instead of HTTPS
    const state = Buffer.from(
      JSON.stringify({
        firebaseUid: "test-uid",
        redirectUri: httpUri,
      })
    ).toString("base64");

    req.query = {
      code: "test-auth-code",
      state: state,
    };

    await oauthHandler(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
