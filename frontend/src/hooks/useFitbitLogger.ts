import { CreateFoodLogRequest } from "@smart-food-logger/shared";
import { FormEvent, useState } from "react";

import { logToFitbit } from "@/app/actions/fitbitLog";
import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";

export const useFitbitLogger = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>("");
  const [isError, setIsError] = useState(false);
  const { idToken } = useFirebaseAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!idToken) {
      setStatusMessage(
        "認証トークンが取得できません。ページをリロードして再度お試しください。",
      );
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

      const result = await logToFitbit(parsedData, idToken);

      if (result.success) {
        setStatusMessage(result.message);
        setIsError(false);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Fitbit連携またはデータ処理エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setStatusMessage(errorMessage);
      setIsError(true);
      return { success: false, message: errorMessage };
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
