import type { Response } from "express";

/**
 * アプリケーション内で使用するカスタムエラーの基底クラス。
 * HTTPステータスコードを保持する `statusCode` プロパティを追加し、
 * APIのレスポンスで適切なステータスを返せるように設計されています。
 */
export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 認証関連のエラー（例: トークン無効、権限不足）を示すクラス。
 * HTTPステータスコードは `401 Unauthorized` がデフォルトです。
 */
export class AuthenticationError extends CustomError {
  constructor(
    message: string = "Authentication failed",
    statusCode: number = 401,
  ) {
    super(message, statusCode);
  }
}

/**
 * リクエストの入力値検証エラー（例: 必須パラメータの欠如、フォーマット不正）を示すクラス。
 * HTTPステータスコードは `400 Bad Request` がデフォルトです。
 */
export class ValidationError extends CustomError {
  constructor(message: string = "Validation failed", statusCode: number = 400) {
    super(message, statusCode);
  }
}

/**
 * 要求されたリソースが見つからない場合のエラーを示すクラス。
 * HTTPステータスコードは `404 Not Found` がデフォルトです。
 */
export class NotFoundError extends CustomError {
  constructor(
    message: string = "Resource not found",
    statusCode: number = 404,
  ) {
    super(message, statusCode);
  }
}

/**
 * Fitbit APIとの通信中に発生したエラーを示すクラス。
 * 外部API起因の問題であることを明確にします。
 * デフォルトのステータスコードは `500 Internal Server Error` とし、クライアント側には詳細を伝えないようにします。
 */
export class FitbitApiError extends CustomError {
  constructor(message: string = "Fitbit API error", statusCode: number = 500) {
    super(message, statusCode);
  }
}

/**
 * サポートされていないHTTPメソッドでエンドポイントが呼び出されたことを示すエラー。
 * HTTPステータスコードは `405 Method Not Allowed` がデフォルトです。
 */
export class MethodNotAllowedError extends CustomError {
  constructor(
    message: string = "Method Not Allowed",
    statusCode: number = 405,
  ) {
    super(message, statusCode);
  }
}

/**
 * 統一的なエラーハンドリングを行うユーティリティ関数。
 * 発生したエラーをログに出力し、クライアントに適切なHTTPステータスコードとメッセージを返します。
 * セキュリティ上の理由から、500以上のエラーや予期せぬエラーの詳細はクライアントに開示せず、
 * 汎用的なメッセージを返します。
 *
 * @param res Expressのレスポンスオブジェクト
 * @param error 発生したエラーオブジェクト
 */
export const handleError = (res: Response, error: unknown): void => {
  // エラーの詳細をサーバーログに出力 (重要)
  console.error("Error caught in handler:", error);

  // カスタムエラーの場合
  if (error instanceof CustomError) {
    // 400番台のエラー（クライアントエラー）はメッセージを返しても安全
    if (error.statusCode < 500) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    // 500番台のエラーは詳細を隠蔽
    res
      .status(error.statusCode)
      .json({ error: "An internal server error occurred." });
    return;
  }

  // 特定のエラーメッセージパターンに対する互換性維持
  // errorがErrorオブジェクトの場合はmessageを取得、それ以外（文字列など）はString変換
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (
    errorMessage.includes("ID token") ||
    errorMessage.includes("Unauthorized")
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // その他の予期せぬエラー
  res.status(500).json({ error: "An internal server error occurred." });
};
