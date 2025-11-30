import { Buffer } from "buffer";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type Mock,
  test,
  vi,
} from "vitest";

import { fitbitWebhookHandler } from "../src/handlers/webhookHandler.js";
import {
  getTokensFromFirestore,
  verifyFirebaseIdToken,
} from "../src/repositories/firebaseRepository.js";
import {
  exchangeCodeForTokens,
  processAndLogFoods,
  refreshFitbitAccessToken,
} from "../src/services/fitbitService.js";
import { AuthenticationError } from "../src/utils/errors.js";

// 外部依存のモック化
vi.mock("../src/repositories/firebaseRepository.js", () => ({
  verifyFirebaseIdToken: vi.fn(),
  getTokensFromFirestore: vi.fn(),
  saveTokensToFirestore: vi.fn(),
}));
vi.mock("../src/services/fitbitService.js");
vi.mock("buffer", () => {
  // vitest importActual returns a promise.
  // For simplicity, we can just use the global Buffer if available or import it.
  // But since we want to mock specific Buffer.from calls...

  // A simpler approach for Buffer mock in Vitest:
  // We can spy on Buffer.from if it's available globally.
  // Or just mock the module.

  return {
    Buffer: {
      from: vi.fn((str, encoding) => {
        if (str === "validStateBase64") {
          return {
            toString: vi.fn(() =>
              JSON.stringify({
                firebaseUid: "testFirebaseUid",
                redirectUri: "http://example.com/redirect",
              }),
            ),
          };
        }
        if (str === "stateWithoutRedirectUriBase64") {
          return {
            toString: vi.fn(() =>
              JSON.stringify({ firebaseUid: "testFirebaseUid" }),
            ),
          };
        }
        if (str === "stateWithoutFirebaseUidBase64") {
          return {
            toString: vi.fn(() =>
              JSON.stringify({ redirectUri: "http://example.com/redirect" }),
            ),
          };
        }
        if (str === "invalidJsonStateBase64") {
          return { toString: vi.fn(() => "invalid json") };
        }
        if (str === "invalidBase64") {
          throw new Error("Invalid base64");
        }
        // Fallback to real Buffer for other cases (like in other tests)
        // Since we are inside the factory, we can't easily access the real Buffer synchronously if we use importActual async.
        // However, Node's Buffer is global.
        return Buffer.from(str, encoding);
      }),
    },
  };
});

describe("fitbitWebhookHandler", () => {
  let mockReq: any;
  let mockRes: any;
  let originalEnv: any;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    // 環境変数のモック
    process.env = {
      ...originalEnv,
      GCP_PROJECT: "test-project",
      FITBIT_REDIRECT_URI: "http://localhost:3000/fitbit-callback",
      FITBIT_CLIENT_ID: "testClientId",
      FITBIT_CLIENT_SECRET: "testClientSecret",
    };

    // モックのリセット
    vi.clearAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {}); // console.errorをモック
    vi.spyOn(console, "log").mockImplementation(() => {}); // console.logもモック

    // resオブジェクトのモック
    mockRes = {
      set: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
      redirect: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks(); // すべてのモックを元に戻す
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // --- 環境変数チェックのテスト ---
  test("should throw error if FITBIT_REDIRECT_URI is not set", async () => {
    delete process.env.FITBIT_REDIRECT_URI;
    await expect(fitbitWebhookHandler({} as any, mockRes)).rejects.toThrow(
      "FITBIT_REDIRECT_URI 環境変数が設定されていません。",
    );
  });

  // --- OPTIONSリクエストのテスト ---
  test("should handle OPTIONS request", async () => {
    mockReq = { method: "OPTIONS" };
    await fitbitWebhookHandler(mockReq, mockRes);
    expect(mockRes.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      "*",
    );
    expect(mockRes.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS",
    );
    expect(mockRes.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.send).toHaveBeenCalledWith("");
  });

  // --- GETリクエスト (Health Check) のテスト ---
  describe("GET request (Health Check)", () => {
    test("should return 200 OK for health check without code parameter", async () => {
      mockReq = {
        method: "GET",
        query: {}, // codeパラメータなし
      };

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Health check passed",
      });
    });
  });

  // --- GETリクエスト (OAuthコールバック) のテスト ---
  describe("GET request (OAuth callback)", () => {
    // 正常系
    test("should exchange code for tokens and redirect if state is valid and includes redirectUri", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "validStateBase64", // firebaseUidとredirectUriを含む
        },
      };

      (exchangeCodeForTokens as Mock).mockResolvedValueOnce(undefined);

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(exchangeCodeForTokens).toHaveBeenCalledWith(
        "testClientId",
        "testClientSecret",
        "testCode",
        "testFirebaseUid",
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        302,
        "http://example.com/redirect?uid=testFirebaseUid",
      );
    });

    test("should exchange code for tokens and send success message if state is valid but no redirectUri", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "stateWithoutRedirectUriBase64", // firebaseUidのみ
        },
      };

      (exchangeCodeForTokens as Mock).mockResolvedValueOnce(undefined);

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(exchangeCodeForTokens).toHaveBeenCalledWith(
        "testClientId",
        "testClientSecret",
        "testCode",
        "testFirebaseUid",
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(
        "Authorization successful! User UID: testFirebaseUid. You can close this page.",
      );
    });

    // 異常系
    test("should return 400 if state parameter is missing", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
        },
      };

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid request: state parameter is missing.",
      });
    });

    test("should return 400 if state parameter cannot be decoded", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "invalidBase64", // 無効なBase64
        },
      };
      // Buffer mock handles this case

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining(
          "Invalid state: could not decode state parameter.",
        ),
      });
    });

    test("should return 400 if decoded state is not valid JSON", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "invalidJsonStateBase64", // 有効なBase64だがJSONではない
        },
      };
      // Buffer mock handles this case

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining(
          "Invalid state: could not decode state parameter.",
        ),
      });
    });

    test("should return 400 if firebaseUid is missing from decoded state", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "stateWithoutFirebaseUidBase64", // firebaseUidがない
        },
      };

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid state: Firebase UID is missing.",
      });
    });

    test("should handle error during exchangeCodeForTokens", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "validStateBase64",
        },
      };
      (exchangeCodeForTokens as Mock).mockRejectedValueOnce(
        new Error("Fitbit API error"),
      );

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Fitbit API error" });
    });

    test("should throw error if FITBIT_CLIENT_ID is not set", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "validStateBase64", // firebaseUidとredirectUriを含む
        },
      };

      delete process.env.FITBIT_CLIENT_ID;
      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          "FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET environment variables must be set",
      });
    });

    test("should throw error if FITBIT_CLIENT_SECRET is not set", async () => {
      mockReq = {
        method: "GET",
        query: {
          code: "testCode",
          state: "validStateBase64", // firebaseUidとredirectUriを含む
        },
      };

      delete process.env.FITBIT_CLIENT_SECRET;
      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          "FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET environment variables must be set",
      });
    });
  });

  // --- POSTリクエスト (食事ログ) のテスト ---
  describe("POST request (food logging)", () => {
    const mockIdToken = "mockIdToken";
    const mockFirebaseUid = "testFirebaseUid";
    const mockNutritionData = {
      meal_type: "breakfast",
      log_date: "2023-01-01",
      log_time: "08:00",
      foods: [{ foodName: "apple", calories: 95 }],
    };
    const mockTokens = {
      accessToken: "oldAccessToken",
      refreshToken: "testRefreshToken",
      expiresAt: new Date().getTime() + 3600 * 1000, // 1時間後
      fitbitUserId: "testFitbitUserId",
    };
    const mockExpiredTokens = {
      accessToken: "expiredAccessToken",
      refreshToken: "testRefreshToken",
      expiresAt: new Date().getTime() - 3600 * 1000, // 1時間前
      fitbitUserId: "testFitbitUserId",
    };

    beforeEach(() => {
      mockReq = {
        method: "POST",
        headers: {
          authorization: `Bearer ${mockIdToken}`,
        },
        body: mockNutritionData,
      };
      (verifyFirebaseIdToken as Mock).mockResolvedValue({
        uid: mockFirebaseUid,
      });
      (getTokensFromFirestore as Mock).mockResolvedValue(mockTokens);
      (processAndLogFoods as Mock).mockResolvedValue([{ success: true }]);
    });

    // 正常系
    test("should log foods successfully with valid token", async () => {
      await fitbitWebhookHandler(mockReq, mockRes);

      expect(verifyFirebaseIdToken).toHaveBeenCalledWith(mockIdToken);
      expect(getTokensFromFirestore).toHaveBeenCalledWith(mockFirebaseUid);
      expect(refreshFitbitAccessToken).not.toHaveBeenCalled(); // トークンは期限内
      expect(processAndLogFoods).toHaveBeenCalledWith(
        mockTokens.accessToken,
        mockNutritionData,
        mockTokens.fitbitUserId,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "All foods logged successfully to Fitbit.",
        loggedData: mockNutritionData,
        fitbitResponses: [{ success: true }],
      });
    });

    test("should refresh token and log foods successfully if token is expired", async () => {
      (getTokensFromFirestore as Mock).mockResolvedValue(mockExpiredTokens);
      (refreshFitbitAccessToken as Mock).mockResolvedValue("newAccessToken");

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(verifyFirebaseIdToken).toHaveBeenCalledWith(mockIdToken);
      expect(getTokensFromFirestore).toHaveBeenCalledWith(mockFirebaseUid);
      expect(refreshFitbitAccessToken).toHaveBeenCalledWith(
        mockFirebaseUid,
        "testClientId",
        "testClientSecret",
      );
      expect(processAndLogFoods).toHaveBeenCalledWith(
        "newAccessToken",
        mockNutritionData,
        mockExpiredTokens.fitbitUserId,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "All foods logged successfully to Fitbit.",
        loggedData: mockNutritionData,
        fitbitResponses: [{ success: true }],
      });
    });

    // 異常系
    test("should return 401 if Authorization header is missing", async () => {
      mockReq.headers.authorization = undefined;

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Unauthorized: Authorization header is missing or invalid.",
      });
    });

    test("should return 401 if Authorization header is invalid", async () => {
      mockReq.headers.authorization = "InvalidToken";

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Unauthorized: Authorization header is missing or invalid.",
      });
    });

    test("should return 401 if verifyFirebaseIdToken fails", async () => {
      (verifyFirebaseIdToken as Mock).mockRejectedValueOnce(
        new AuthenticationError("Firebase auth error"),
      );

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Firebase auth error",
      });
    });

    test("should return 400 if nutritionData is missing", async () => {
      mockReq.body = undefined;

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          'Invalid JSON body. Required: meal_type, log_date, log_time, and a non-empty "foods" array.',
      });
    });

    test("should return 400 if nutritionData.foods is missing", async () => {
      mockReq.body = { meal_type: "breakfast" };

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          'Invalid JSON body. Required: meal_type, log_date, log_time, and a non-empty "foods" array.',
      });
    });

    test("should return 400 if nutritionData.foods is not an array", async () => {
      mockReq.body = { foods: "not an array" };

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          'Invalid JSON body. Required: meal_type, log_date, log_time, and a non-empty "foods" array.',
      });
    });

    test("should return 401 if no tokens found for user", async () => {
      (getTokensFromFirestore as Mock).mockResolvedValueOnce(null);

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: `No tokens found for user ${mockFirebaseUid}. Please complete the OAuth flow.`,
      });
    });

    test("should return 500 if refreshFitbitAccessToken fails", async () => {
      (getTokensFromFirestore as Mock).mockResolvedValue(mockExpiredTokens);
      (refreshFitbitAccessToken as Mock).mockRejectedValueOnce(
        new Error("Refresh failed"),
      );

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Refresh failed" });
    });

    test("should return 500 if fitbitUserId is missing from tokens", async () => {
      (getTokensFromFirestore as Mock).mockResolvedValueOnce({
        ...mockTokens,
        fitbitUserId: undefined,
      });

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Fitbit user ID not found in the database.",
      });
    });

    test("should return 500 if processAndLogFoods fails", async () => {
      (processAndLogFoods as Mock).mockRejectedValueOnce(
        new Error("Fitbit logging error"),
      );

      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Fitbit logging error",
      });
    });

    test("should return 500 for unhandled errors", async () => {
      (verifyFirebaseIdToken as Mock).mockRejectedValueOnce(
        new Error("unknown error"),
      );
      await fitbitWebhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "unknown error",
      });
    });
  });

  // --- その他のリクエストメソッドのテスト ---
  test("should return 405 for unsupported methods", async () => {
    mockReq = { method: "PUT" }; // GET (codeなし) も同様
    await fitbitWebhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Method Not Allowed" });
  });
});
