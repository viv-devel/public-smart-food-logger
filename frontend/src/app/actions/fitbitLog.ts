"use server";

import { CreateFoodLogRequest, ErrorDetail } from "@smart-food-logger/shared";

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
    // バリデーション (簡易チェック - 詳細なバリデーションはバックエンドで行うが、最低限のチェックはここでも)
    if (!data.foods || !Array.isArray(data.foods) || data.foods.length === 0) {
      return {
        success: false,
        message: "必須項目 `foods` 配列がJSONに含まれていないか、空です。",
      };
    }
    if (!data.log_date || typeof data.log_date !== "string") {
      return {
        success: false,
        message: "必須項目 `log_date` (YYYY-MM-DD) がJSONに含まれていません。",
      };
    }
    if (!data.log_time || typeof data.log_time !== "string") {
      return {
        success: false,
        message: "必須項目 `log_time` (HH:MM:SS) がJSONに含まれていません。",
      };
    }
    if (!data.meal_type || typeof data.meal_type !== "string") {
      return {
        success: false,
        message: "必須項目 `meal_type` がJSONに含まれていません。",
      };
    }

    // userIdはCreateFoodLogRequestでは不要なため除外
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _userId, ...dataToSend } = data;

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
