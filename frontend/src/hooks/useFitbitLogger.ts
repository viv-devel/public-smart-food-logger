import { CreateFoodLogRequest, ErrorDetail } from "@smart-food-logger/shared";
import { FormEvent, useEffect, useState } from "react";

import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";

const API_ENDPOINT = process.env.NEXT_PUBLIC_FITBIT_API_ENDPOINT || "";

export const useFitbitLogger = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>("");
  const [isError, setIsError] = useState(false);
  const { idToken } = useFirebaseAuth();

  useEffect(() => {
    if (!API_ENDPOINT) {
      console.error("NEXT_PUBLIC_FITBIT_API_ENDPOINT is not defined");
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!idToken) {
      setStatusMessage(
        "認証トークンが取得できません。ページをリロードして再度お試しください。",
      );
      setIsError(true);
      return;
    }

    if (!API_ENDPOINT) {
      setStatusMessage("APIエンドポイントが設定されていません。");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage("Fitbit認証と記録をCloud Functionに依頼中...");
    setIsError(false);

    try {
      let parsedData: Partial<CreateFoodLogRequest>;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (e) {
        console.error("JSON parsing error:", e);
        throw new Error(
          "JSONの形式が正しくありません。貼り付けた内容を確認してください。",
        );
      }

      // バリデーション
      if (
        !parsedData.foods ||
        !Array.isArray(parsedData.foods) ||
        parsedData.foods.length === 0
      ) {
        throw new Error(
          "必須項目 `foods` 配列がJSONに含まれていないか、空です。",
        );
      }
      if (!parsedData.log_date || typeof parsedData.log_date !== "string") {
        throw new Error(
          "必須項目 `log_date` (YYYY-MM-DD) がJSONに含まれていません。",
        );
      }
      if (!parsedData.log_time || typeof parsedData.log_time !== "string") {
        throw new Error(
          "必須項目 `log_time` (HH:MM:SS) がJSONに含まれていません。",
        );
      }
      if (!parsedData.meal_type || typeof parsedData.meal_type !== "string") {
        throw new Error("必須項目 `meal_type` がJSONに含まれていません。");
      }

      // userIdはCreateFoodLogRequestでは不要なため除外
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _userId, ...dataToSend } = parsedData;

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
        setIsError(false);
        return { success: true, message: result.message };
      } else {
        const errorResult: ErrorDetail = await response.json();
        let errorMessage = "記録に失敗しました。";

        if (errorResult.details?.errors?.[0]?.message) {
          errorMessage = `Fitbit APIエラー: ${errorResult.details.errors[0].message}`;
        } else if (errorResult.error) {
          errorMessage = `サーバーエラー: ${errorResult.error}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Fitbit連携またはデータ処理エラー:", error);
      setStatusMessage(
        error instanceof Error ? error.message : "不明なエラーが発生しました。",
      );
      setIsError(true);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    jsonInput,
    setJsonInput,
    isLoading,
    statusMessage,
    setStatusMessage,
    isError,
    handleSubmit,
  };
};
