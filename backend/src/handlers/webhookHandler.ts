import { HttpFunction } from "@google-cloud/functions-framework";
import { CreateFoodLogRequest } from "@smart-food-logger/shared";
import { Buffer } from "buffer";

import {
  getTokensFromFirestore,
  verifyFirebaseIdToken,
} from "../repositories/firebaseRepository.js";
import {
  exchangeCodeForTokens,
  processAndLogFoods,
  refreshFitbitAccessToken,
} from "../services/fitbitService.js";
import {
  AuthenticationError,
  FitbitApiError,
  MethodNotAllowedError,
  ValidationError,
} from "../utils/errors.js";

/**
 * Fitbit API連携の中核を担うHTTP Cloud Function。
 * 1. GET (クエリなし): ヘルスチェック
 * 2. GET (codeクエリあり): Fitbit OAuth 2.0認証のコールバック処理
 * 3. POST: 食事ログの記録リクエスト処理
 * 4. OPTIONS: CORSプリフライトリクエストの処理
 *
 * 認証フロー:
 * - フロントエンドはFirebaseのUIDとリダイレクトURIをエンコードした`state`パラメータを生成し、ユーザーをFitbitの認証画面にリダイレクトさせる。
 * - 認証後、Fitbitは指定されたリダイレクトURI（このWebhook）に `code` と `state` を付けてリダイレクトする。
 * - このハンドラは `state` をデコードしてFirebase UIDを取得し、`code` を使ってFitbitのアクセストークンを取得・保存する。
 * - その後、`state` に含まれていた元のリダイレクトURIにユーザーをリダイレクトし、フロントエンド側でログイン完了処理を行う。
 *
 * 食事ログ記録フロー:
 * - フロントエンドはFirebase Authで認証し、取得したIDトークンを `Authorization: Bearer <ID_TOKEN>` ヘッダーに含めてPOSTリクエストを送信する。
 * - このハンドラはIDトークンを検証してFirebase UIDを取得し、Firestoreから対応するFitbitトークンを検索する。
 * - トークンを使ってFitbit APIに食事データを記録する。
 * - トークンの有効期限が切れている場合は、リフレッシュしてからAPIリクエストを実行する。
 *
 * @param req Express互換のリクエストオブジェクト
 * @param res Express互換のレスポンスオブジェクト
 */
export const fitbitWebhookHandler: HttpFunction = async (req, res) => {
  // 必要な環境変数のチェック
  if (!process.env.FITBIT_REDIRECT_URI) {
    throw new Error("FITBIT_REDIRECT_URI 環境変数が設定されていません。");
  }

  // CORSプリフライトリクエストに対応するためのヘッダーを設定
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // OPTIONSメソッドはCORSプリフライトリクエスト。ヘッダーを付与して204で即時終了する。
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Health Check: codeパラメータがない単純なGETリクエスト
  if (req.method === "GET" && !req.query.code) {
    res.status(200).json({ status: "OK", message: "Health check passed" });
    return;
  }

  try {
    // 環境変数からFitbit認証情報を取得
    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET environment variables must be set",
      );
    }

    // OAuthコールバック: 認証コードをトークンと交換
    if (req.method === "GET" && req.query.code) {
      const state = req.query.state as string;
      if (!state) {
        throw new ValidationError(
          "Invalid request: state parameter is missing.",
        );
      }

      let firebaseUid, redirectUri;
      try {
        // stateパラメータは、フロントエンドでBase64エンコードされたJSON文字列。
        // これにより、OAuthフローを介して複数の情報（ここではUIDとリダイレクト先）を安全に渡すことができる。
        // 仕様: { firebaseUid: string; redirectUri: string; }
        const decodedState = JSON.parse(
          Buffer.from(state, "base64").toString("utf8"),
        );
        firebaseUid = decodedState.firebaseUid;
        redirectUri = decodedState.redirectUri;
      } catch (e: any) {
        throw new ValidationError(
          `Invalid state: could not decode state parameter. Error: ${e.message}`,
        );
      }

      if (!firebaseUid) {
        throw new ValidationError("Invalid state: Firebase UID is missing.");
      }

      await exchangeCodeForTokens(
        clientId,
        clientSecret,
        req.query.code as string,
        firebaseUid,
      );

      if (redirectUri) {
        const redirectUrl = new URL(redirectUri);
        // クエリパラメータでFitbitユーザーIDの代わりにFirebase UIDを使用
        redirectUrl.searchParams.set("uid", firebaseUid);
        res.redirect(302, redirectUrl.toString());
        return;
      }
      res
        .status(200)
        .send(
          `Authorization successful! User UID: ${firebaseUid}. You can close this page.`,
        );
      return;
    }

    // メインロジック: 食事ログのリクエストを処理 (認証が必要)
    if (req.method === "POST") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError(
          "Unauthorized: Authorization header is missing or invalid.",
        );
      }
      const idToken = authHeader.split("Bearer ")[1];

      // IDトークンを検証してFirebase UIDを取得
      const decodedToken = await verifyFirebaseIdToken(idToken);
      const firebaseUid = decodedToken.uid;

      const nutritionData = req.body as CreateFoodLogRequest;

      if (
        !nutritionData ||
        !nutritionData.foods ||
        !Array.isArray(nutritionData.foods)
      ) {
        throw new ValidationError(
          'Invalid JSON body. Required: meal_type, log_date, log_time, and a non-empty "foods" array.',
        );
      }

      const tokens = await getTokensFromFirestore(firebaseUid);
      if (!tokens) {
        throw new AuthenticationError(
          `No tokens found for user ${firebaseUid}. Please complete the OAuth flow.`,
        );
      }

      let accessToken;
      // トークンの有効期限が切れているかチェックし、必要であればリフレッシュ
      if (new Date().getTime() >= tokens.expiresAt) {
        console.log(`Token for user ${firebaseUid} has expired. Refreshing...`);
        accessToken = await refreshFitbitAccessToken(
          firebaseUid,
          clientId,
          clientSecret,
        );
      } else {
        accessToken = tokens.accessToken;
      }

      // FirestoreからFitbitユーザーIDを使用
      const fitbitUserId = tokens.fitbitUserId;
      if (!fitbitUserId) {
        throw new FitbitApiError(
          "Fitbit user ID not found in the database.",
          500,
        );
      }

      const fitbitResponses = await processAndLogFoods(
        accessToken,
        nutritionData,
        fitbitUserId,
      );

      res.status(200).json({
        message: "All foods logged successfully to Fitbit.",
        loggedData: nutritionData,
        fitbitResponses: fitbitResponses,
      });
      return;
    }

    throw new MethodNotAllowedError("Method Not Allowed");
  } catch (error: any) {
    console.error("Unhandled error in fitbitWebhookHandler:", error);
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    } else if (
      error.message.includes("ID token") ||
      error.message.includes("Unauthorized")
    ) {
      res.status(401).json({ error: error.message });
      return;
    }
    res
      .status(500)
      .json({ error: error.message || "An internal server error occurred." });
    return;
  }
};
