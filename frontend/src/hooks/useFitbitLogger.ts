import { CreateFoodLogRequest } from "@smart-food-logger/shared";
import { FormEvent, useState } from "react";

import { logToFitbit } from "@/app/actions/fitbitLog";
import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";

/**
 * Fitbitへの食事ログ記録機能に関連する状態とロジックを管理するカスタムフック。
 *
 * @returns {object} 以下の状態と関数を含むオブジェクト
 *  - `jsonInput`: 食事データJSON文字列の入力状態
 *  - `setJsonInput`: `jsonInput` を更新するセッター
 *  - `isLoading`: データ送信中のローディング状態
 *  - `statusMessage`: ユーザーへの結果通知メッセージ
 *  - `setStatusMessage`: `statusMessage` を更新するセッター
 *  - `isError`: エラーが発生したかどうかの状態
 *  - `handleSubmit`: フォーム送信時に実行される非同期関数
 *  - `registeredFoods`: 登録に成功した食品名のリスト
 *  - `resetState`: 状態をリセットし、次の入力に備える関数
 */
export const useFitbitLogger = () => {
  /** @dev Geminiから受け取った食事ログのJSON文字列を保持する */
  const [jsonInput, setJsonInput] = useState("");
  /** @dev Fitbit APIへのリクエスト中のローディング状態 */
  const [isLoading, setIsLoading] = useState(false);
  /** @dev ユーザーに表示する処理結果のメッセージ */
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>("");
  /** @dev 処理結果がエラーかどうかのフラグ */
  const [isError, setIsError] = useState(false);
  /** @dev 登録に成功した食品名のリスト */
  const [registeredFoods, setRegisteredFoods] = useState<string[]>([]);

  const { idToken } = useFirebaseAuth();

  /**
   * フォームの送信イベントを処理し、入力されたJSONデータをFitbitに記録する。
   *
   * 1. FirebaseからIDトークンを取得できているか確認する。
   * 2. 入力された文字列をJSONとしてパースする。
   * 3. パースしたデータとIDトークンをServer Action `logToFitbit` に渡して実行する。
   * 4. Server Actionの実行結果に応じて、成功またはエラーのメッセージを表示する。
   *
   * @param {FormEvent<HTMLFormElement>} event - フォームのsubmitイベント
   * @returns {Promise<{success: boolean, message: string} | undefined>} 処理結果。成功か失敗かとメッセージを含む。
   */
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
    setRegisteredFoods([]);

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
        // 成功した場合、食品名を抽出して状態に保存
        if (parsedData.foods && Array.isArray(parsedData.foods)) {
          setRegisteredFoods(
            parsedData.foods.map((f: { foodName: string }) => f.foodName),
          );
        }
      } else {
        setStatusMessage(result.message);
        setIsError(true);
      }
      return result;
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

  /**
   * 状態をリセットし、次の入力に備える。
   */
  const resetState = () => {
    setJsonInput("");
    setStatusMessage("");
    setIsError(false);
    setRegisteredFoods([]);
    setIsLoading(false);
  };

  return {
    jsonInput,
    setJsonInput,
    isLoading,
    statusMessage,
    setStatusMessage,
    isError,
    setIsError,
    handleSubmit,
    registeredFoods,
    resetState,
  };
};
