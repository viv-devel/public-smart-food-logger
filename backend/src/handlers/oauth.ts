import { HttpFunction } from "@google-cloud/functions-framework";
import { Buffer } from "buffer";

import { exchangeCodeForTokens } from "../services/fitbitService.js";
import { MethodNotAllowedError, ValidationError } from "../utils/errors.js";
import { withRecaptcha } from "../utils/withRecaptcha.js";

/**
 * Fitbit OAuth 2.0 認証のコールバック処理を行う Cloud Function。
 *
 * @param req Express互換のリクエストオブジェクト
 * @param res Express互換のレスポンスオブジェクト
 */
export const oauthHandler: HttpFunction = withRecaptcha(
  "AUTHENTICATE",
  async (req, res) => {
    // 必要な環境変数のチェック
    if (!process.env.OAUTH_FITBIT_REDIRECT_URI) {
      throw new Error(
        "OAUTH_FITBIT_REDIRECT_URI 環境変数が設定されていません。",
      );
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

      throw new MethodNotAllowedError("Method Not Allowed");
    } catch (error: any) {
      console.error("Unhandled error in oauthHandler:", error);
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
  },
);
