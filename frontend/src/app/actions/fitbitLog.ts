"use server";

import {
  CreateFoodLogRequestSchema,
  ErrorDetail,
} from "@smart-food-logger/shared";

type LogToFitbitResult = {
  success: boolean;
  message: string;
};

export async function logToFitbit(
  data: unknown,
  idToken: string,
): Promise<LogToFitbitResult> {
  const API_ENDPOINT = process.env.BACKEND_FITBIT_WEBHOOK_URL;

  if (!API_ENDPOINT) {
    console.error("BACKEND_FITBIT_WEBHOOK_URL is not defined");
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
