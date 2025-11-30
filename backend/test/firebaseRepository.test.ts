import admin from "firebase-admin";
import { vi } from "vitest";

import {
  getTokensFromFirestore,
  saveTokensToFirestore,
  verifyFirebaseIdToken,
} from "../src/repositories/firebaseRepository.js";
import { AuthenticationError } from "../src/utils/errors.js";

// Firebase Admin SDKのモック
vi.mock("firebase-admin", () => {
  const mockAuth = {
    verifyIdToken: vi.fn(),
  };
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockDoc = vi.fn(() => ({
    get: mockGet,
    set: mockSet,
  }));
  const mockLimit = vi.fn();
  const mockGetQuery = vi.fn();
  const mockWhere = vi.fn(() => ({
    limit: mockLimit,
  }));
  const mockCollection = {
    doc: mockDoc,
    where: mockWhere,
  };
  const mockFirestore = {
    collection: vi.fn(() => mockCollection),
  };
  const mockArrayUnion = vi.fn((...args) => ({
    _methodName: "FieldValue.arrayUnion",
    _elements: args,
  }));

  const mockAdmin = {
    initializeApp: vi.fn(),
    apps: [],
    auth: vi.fn(() => mockAuth),
    firestore: Object.assign(
      vi.fn(() => mockFirestore),
      {
        FieldValue: {
          arrayUnion: mockArrayUnion,
        },
      },
    ),
    __mocks: {
      mockAuth,
      mockGet,
      mockSet,
      mockDoc,
      mockWhere,
      mockLimit,
      mockGetQuery,
      mockCollection,
      mockFirestore,
      mockArrayUnion,
    },
  };

  return {
    ...mockAdmin,
    default: mockAdmin,
  };
});

const {
  mockAuth,
  mockSet,
  mockDoc,
  mockWhere,
  mockLimit,
  mockGetQuery,
  mockFirestore,
  mockArrayUnion,
} = (admin as any).__mocks;

describe("Firebase Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (admin.apps as any) = [];
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.GCP_PROJECT = "test-project";

    // デフォルトのモック設定
    mockLimit.mockReturnValue({
      get: mockGetQuery,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("verifyFirebaseIdToken", () => {
    test("should throw AuthenticationError if idToken is not provided", async () => {
      await expect(verifyFirebaseIdToken(null as any)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(verifyFirebaseIdToken("")).rejects.toThrow(
        AuthenticationError,
      );
      expect(mockAuth.verifyIdToken).not.toHaveBeenCalled();
    });

    test("should throw AuthenticationError for an invalid ID token", async () => {
      mockAuth.verifyIdToken.mockRejectedValueOnce(new Error("Invalid token"));
      await expect(verifyFirebaseIdToken("invalidToken")).rejects.toThrow(
        AuthenticationError,
      );
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith("invalidToken");
    });

    test("should return decoded token for a valid ID token", async () => {
      const mockDecodedToken = {
        uid: "testUid",
        email: "test@example.com",
      };
      mockAuth.verifyIdToken.mockResolvedValueOnce(mockDecodedToken);
      const decodedToken = await verifyFirebaseIdToken("validToken");
      expect(decodedToken).toEqual(mockDecodedToken);
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith("validToken");
    });
  });

  describe("getTokensFromFirestore", () => {
    test("should return null if no token is found for the user", async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: [],
      };
      mockGetQuery.mockResolvedValueOnce(mockQuerySnapshot);

      const tokens = await getTokensFromFirestore("testFirebaseUid");

      expect(tokens).toBeNull();
      expect(mockFirestore.collection).toHaveBeenCalledWith("fitbit_tokens");
      expect(mockWhere).toHaveBeenCalledWith(
        "firebaseUids",
        "array-contains",
        "testFirebaseUid",
      );
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(console.log).toHaveBeenCalledWith(
        "No token found for user testFirebaseUid",
      );
    });

    test("should return token data if found for the user using where query", async () => {
      const mockTokenData = {
        accessToken: "abc",
        refreshToken: "xyz",
        fitbitUserId: "fitbit123",
        firebaseUids: ["testFirebaseUid"],
        expiresAt: 1234567890,
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            data: () => mockTokenData,
          },
        ],
      };
      mockGetQuery.mockResolvedValueOnce(mockQuerySnapshot);

      const tokens = await getTokensFromFirestore("testFirebaseUid");

      expect(tokens).toEqual(mockTokenData);
      expect(mockFirestore.collection).toHaveBeenCalledWith("fitbit_tokens");
      expect(mockWhere).toHaveBeenCalledWith(
        "firebaseUids",
        "array-contains",
        "testFirebaseUid",
      );
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe("saveTokensToFirestore", () => {
    test("should save tokens to firestore with fitbitUserId as document ID and use arrayUnion", async () => {
      const firebaseUid = "testFirebaseUid";
      const fitbitUserId = "fitbit123";
      const tokens = {
        access_token: "newAccessToken",
        refresh_token: "newRefreshToken",
        expires_in: 3600,
      };

      const mockDateNow = 1678886400000;
      vi.useFakeTimers();
      vi.setSystemTime(mockDateNow);

      await saveTokensToFirestore(firebaseUid, fitbitUserId, tokens);

      const expectedExpiresAt = mockDateNow + tokens.expires_in * 1000;

      expect(mockFirestore.collection).toHaveBeenCalledWith("fitbit_tokens");
      expect(mockDoc).toHaveBeenCalledWith(fitbitUserId); // fitbitUserIdをドキュメントIDとして使用
      expect(mockArrayUnion).toHaveBeenCalledWith(firebaseUid);
      expect(mockSet).toHaveBeenCalledWith(
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: expectedExpiresAt,
          fitbitUserId: fitbitUserId,
          firebaseUids: {
            _methodName: "FieldValue.arrayUnion",
            _elements: [firebaseUid],
          },
        },
        {
          merge: true,
        },
      );
      expect(console.log).toHaveBeenCalledWith(
        `Successfully saved tokens for Firebase user ${firebaseUid} (Fitbit user ${fitbitUserId})`,
      );

      vi.useRealTimers();
    });
  });
});
