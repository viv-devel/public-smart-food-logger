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
