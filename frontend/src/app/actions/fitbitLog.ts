"use server";

import {
  CreateFoodLogRequestSchema,
  ErrorDetail,
} from "@smart-food-logger/shared";

/**
 * @typedef {object} LogToFitbitResult
 * @property {boolean} success - 処理が成功したかどうか
 * @property {string} message - ユーザーへの通知メッセージ
 */
type LogToFitbitResult = {
  success: boolean;
  message: string;
};

/**
 * クライアントから受け取った食事データを検証し、バックエンドのWebhook APIに送信するServer Action。
 * FirebaseのIDトークンを利用してバックエンドでの認証を行う。
 *
 * @param {unknown} data - クライアントから送信された食事データ。Zodスキーマ `CreateFoodLogRequestSchema` で検証される。
 * @param {string} idToken - Firebase Authから取得したIDトークン。バックエンドAPIの認証に使用する。
 * @returns {Promise<LogToFitbitResult>} 処理結果。成功・失敗とメッセージを含む。
 */
export async function logToFitbit(
  data: unknown,
  idToken: string,
): Promise<LogToFitbitResult> {
  // E2Eテスト用のモック: NEXT_PUBLIC_MOCK_AUTH が true の場合は実際のAPI呼び出しをスキップする
  // (Server Actionはサーバーサイドで実行されるため、process.envを参照可能)
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    console.log("Mock Auth enabled: Skipping real Fitbit API call.");

    // バリデーション自体は実行して、不正なデータでのテストを可能にする
    const validationResult = CreateFoodLogRequestSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      return {
        success: false,
        message: `入力データに誤りがあります:\n${errorMessages}`,
      };
    }

    return {
      success: true,
      message: "Fitbitに記録しました。(Mock)",
    };
  }

  const API_ENDPOINT = process.env.FOOD_LOG_URL;

  // 環境変数が設定されていない場合は、設定不備としてエラーを返す。
  // これは開発者が気づくべき問題であり、ユーザーに直接的な原因はない。
  if (!API_ENDPOINT) {
    console.error("FOOD_LOG_URL is not defined");
    return {
      success: false,
      message: "サーバー設定エラー: APIエンドポイントが設定されていません。",
    };
  }

  try {
    // バリデーション (Zodスキーマを使用)
    const validationResult = CreateFoodLogRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      return {
        success: false,
        message: `入力データに誤りがあります:\n${errorMessages}`,
      };
    }

    // バリデーション済みのデータを使用
    // userIdはCreateFoodLogRequestでは不要なため除外 (スキーマ定義に含まれているがAPI送信時には除外したい場合)
    // ただし、CreateFoodLogRequestSchemaはuserIdをoptionalとして持っている。
    // ここでは validationResult.data を使うのが安全。
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _userId, ...dataToSend } = validationResult.data;

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      const result: { message?: string } = await response.json();
      return {
        success: true,
        message: result.message ?? "Fitbitに記録しました。",
      };
    } else {
      const errorResult: ErrorDetail = await response.json();
      let errorMessage = "記録に失敗しました。";

      if (errorResult.details?.errors?.[0]?.message) {
        errorMessage = `Fitbit APIエラー: ${errorResult.details.errors[0].message}`;
      } else if (errorResult.error) {
        errorMessage = `サーバーエラー: ${errorResult.error}`;
      }
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.error("Fitbit連携またはデータ処理エラー:", error);
    return {
      success: false,
      message: "Fitbit連携に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
