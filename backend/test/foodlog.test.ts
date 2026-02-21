import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { foodLogHandler } from "../src/handlers/foodlog.js";
import { Request, Response } from "express";
import * as firebaseRepo from "../src/repositories/firebaseRepository.js";
import * as fitbitService from "../src/services/fitbitService.js";

// Mock dependencies
vi.mock("../src/repositories/firebaseRepository.js");
vi.mock("../src/services/fitbitService.js");

const mockReq = (method = "POST", body: any = {}, headers: any = {}) => {
  const req: Partial<Request> = {
    method,
    body,
    headers,
  };
  return req as Request;
};

const mockRes = () => {
  const res: Partial<Response> = {};
  res.set = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("foodLogHandler", () => {
  let req: Request;
  let res: Response;

  const validBody = {
    foods: [
      {
        foodName: "Apple",
        calories: 95,
        protein: 0.5,
        fat: 0.3,
        carbs: 25,
        unit: "medium",
        amount: 1,
        date: "2023-10-27",
        mealType: "Breakfast",
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.FITBIT_REDIRECT_URI = "http://localhost:3000/callback";
    process.env.FITBIT_CLIENT_ID = "test-client-id";
    process.env.FITBIT_CLIENT_SECRET = "test-client-secret";

    res = mockRes();
  });

  afterEach(() => {
    delete process.env.FITBIT_REDIRECT_URI;
    delete process.env.FITBIT_CLIENT_ID;
    delete process.env.FITBIT_CLIENT_SECRET;
  });

  it("should throw error if FITBIT_REDIRECT_URI is missing", async () => {
    delete process.env.FITBIT_REDIRECT_URI;
    req = mockReq();
    await expect(foodLogHandler(req, res)).rejects.toThrow(
      "FITBIT_REDIRECT_URI 環境変数が設定されていません。",
    );
  });

  it("should handle OPTIONS request (CORS)", async () => {
    req = mockReq("OPTIONS");
    await foodLogHandler(req, res);
    expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith("");
  });

  it("should return 405 for non-POST/OPTIONS requests", async () => {
    req = mockReq("GET");
    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("should return 401 if Authorization header is missing", async () => {
    req = mockReq("POST", validBody); // No headers
    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Authorization header is missing"),
      }),
    );
  });

  it("should return 401 if Authorization header is invalid", async () => {
    req = mockReq("POST", validBody, { authorization: "InvalidToken" });
    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 if verifyFirebaseIdToken fails", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer invalid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockRejectedValue(
      new Error("Invalid ID token"),
    );

    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("should return 400 for invalid body (missing foods)", async () => {
    req = mockReq("POST", {}, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);
    // Needed because auth check is now before validation
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue({
      accessToken: "valid-access-token",
      expiresAt: Date.now() + 10000,
      fitbitUserId: "fitbit-user-id",
      firebaseUids: ["test-uid"],
    });

    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400); // ValidationError
  });

  it("should return 400 for invalid body (foods is not array)", async () => {
    req = mockReq(
      "POST",
      { foods: "not-an-array" },
      { authorization: "Bearer valid-token" },
    );
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);
    // Needed because auth check is now before validation
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue({
      accessToken: "valid-access-token",
      expiresAt: Date.now() + 10000,
      fitbitUserId: "fitbit-user-id",
      firebaseUids: ["test-uid"],
    });

    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 401 if no tokens found for user", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue(null);

    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("No tokens found"),
      }),
    );
  });

  it("should refresh token if expired", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as any);

    const expiredTokens = {
      accessToken: "old-access-token",
      refreshToken: "refresh-token",
      expiresAt: Date.now() - 1000, // Expired
      fitbitUserId: "fitbit-user-id",
      firebaseUids: ["test-uid"],
    };
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue(
      expiredTokens,
    );
    vi.mocked(fitbitService.refreshFitbitAccessToken).mockResolvedValue(
      "new-access-token",
    );
    vi.mocked(fitbitService.processAndLogFoods).mockResolvedValue([]);

    await foodLogHandler(req, res);

    expect(fitbitService.refreshFitbitAccessToken).toHaveBeenCalledWith(
      "test-uid",
      "test-client-id",
      "test-client-secret",
    );
    expect(fitbitService.processAndLogFoods).toHaveBeenCalledWith(
      "new-access-token",
      validBody,
      "fitbit-user-id",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should use existing token if valid", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);

    const validTokens = {
      accessToken: "valid-access-token",
      expiresAt: Date.now() + 10000, // Valid
      fitbitUserId: "fitbit-user-id",
      firebaseUids: ["test-uid"],
    };
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue(
      validTokens,
    );
    vi.mocked(fitbitService.processAndLogFoods).mockResolvedValue([]);

    await foodLogHandler(req, res);

    expect(fitbitService.refreshFitbitAccessToken).not.toHaveBeenCalled();
    expect(fitbitService.processAndLogFoods).toHaveBeenCalledWith(
      "valid-access-token",
      validBody,
      "fitbit-user-id",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 if fitbitUserId is missing", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);

    const tokensNoId = {
      accessToken: "valid-access-token",
      expiresAt: Date.now() + 10000,
      firebaseUids: ["test-uid"],
      // fitbitUserId missing
    };
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue(
      tokensNoId as any, // keeping as any here because it's intentionally missing property for test
    );

    await foodLogHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500); // FitbitApiError defaults to 500
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "An internal server error occurred.",
      }),
    );
  });

  it("should return 200 on success", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue({
      accessToken: "valid-access-token",
      expiresAt: Date.now() + 10000,
      fitbitUserId: "fitbit-user-id",
      firebaseUids: ["test-uid"],
    });

    const mockFitbitResponse = [{ status: 201, data: {} }];
    vi.mocked(fitbitService.processAndLogFoods).mockResolvedValue(
      mockFitbitResponse as any,
    );

    await foodLogHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "All foods logged successfully to Fitbit.",
        fitbitResponses: mockFitbitResponse,
      }),
    );
  });

  it("should handle errors from processAndLogFoods", async () => {
    req = mockReq("POST", validBody, { authorization: "Bearer valid-token" });
    vi.mocked(firebaseRepo.verifyFirebaseIdToken).mockResolvedValue({
      uid: "test-uid",
    } as import("firebase-admin/auth").DecodedIdToken);
    vi.mocked(firebaseRepo.getTokensFromFirestore).mockResolvedValue({
      accessToken: "valid-access-token",
      expiresAt: Date.now() + 10000,
      fitbitUserId: "fitbit-user-id",
      firebaseUids: ["test-uid"],
    });

    vi.mocked(fitbitService.processAndLogFoods).mockRejectedValue(
      new Error("Fitbit API Down"),
    );

    await foodLogHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "An internal server error occurred." }),
    );
  });
});
