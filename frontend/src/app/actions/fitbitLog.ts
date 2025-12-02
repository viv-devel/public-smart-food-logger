"use server";

import {
  CreateFoodLogRequest,
  CreateFoodLogRequestSchema,
  ErrorDetail,
} from "@smart-food-logger/shared";

export async function logToFitbit(
  data: Partial<CreateFoodLogRequest>,
  idToken: string,
) {
  const API_ENDPOINT = process.env.FITBIT_API_ENDPOINT;

  if (!API_ENDPOINT) {
    console.error("FITBIT_API_ENDPOINT is not defined");
    return {
      success: false,
      message: "サーバー設定エラー: APIエンドポイントが設定されていません。",
    };
  }

  try {
    // バリデーション (Zodスキーマを使用)
    const validationResult = CreateFoodLogRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const errorMessages = (validationResult.error as any).errors
        .map((err: any) => `${err.path.join(".")}: ${err.message}`)
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
      const result = await response.json();
      return { success: true, message: result.message };
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
      message:
        error instanceof Error ? error.message : "不明なエラーが発生しました。",
    };
  }
}
