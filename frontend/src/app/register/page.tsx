"use client";

import Link from "next/link";
import { FormEvent } from "react";

import { useFitbitLogger } from "@/hooks/useFitbitLogger";
import { generateTemplate } from "@/utils/fitbitTemplate";

/**
 * 食事記録登録（JSON入力）ページコンポーネント。
 *
 * ユーザーがGeminiから生成されたJSONデータを貼り付け、Fitbit APIへの登録を実行するメイン機能を提供する。
 * `useFitbitLogger` フックを使用し、フォーム送信、バリデーション、API通信の状態を管理する。
 *
 * 主な機能:
 * - JSON貼り付け用テキストエリア（クリップボード貼り付け対応）。
 * - テンプレート読み込み/クリア機能。
 * - 送信実行と結果メッセージの表示。
 * - 成功時のサマリー表示と連続登録フロー。
 */
export default function FitbitViaGeminiRegisterPage() {
  const {
    jsonInput,
    setJsonInput,
    isLoading,
    statusMessage,
    setStatusMessage,
    isError,
    handleSubmit,
    registeredFoods,
    resetState,
  } = useFitbitLogger();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Hooks側で処理が完結し、registeredFoodsが更新されるため、ここでは追加処理不要
    await handleSubmit(event);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      setStatusMessage("クリップボードからの貼り付けに失敗しました。");
      // エラー表示のためにフラグを立てる（ただし、入力自体はブロックしない）
    }
  };

  // 成功画面（登録済みリストがある場合）
  if (registeredFoods.length > 0) {
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center">
        <div className="bg-green-900/30 border border-green-600 rounded-xl p-8 shadow-lg">
          <div className="text-green-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            登録が完了しました！
          </h2>
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left inline-block w-full max-w-md">
            <h3 className="text-gray-400 text-sm mb-2 border-b border-gray-700 pb-1">
              登録されたメニュー
            </h3>
            <ul className="list-disc list-inside text-gray-200 space-y-1">
              {registeredFoods.map((food, index) => (
                <li key={index} className="truncate">
                  {food}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-gray-300 mb-8">
            Fitbitへの食事ログの追加が正常に完了しました。
          </p>

          <div className="flex flex-col gap-4 justify-center items-center">
            <button
              onClick={resetState}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              続けて次の食事を記録する
            </button>
            <Link
              href="/tips"
              className="text-sm text-gray-400 hover:text-white underline transition-colors"
            >
              便利な使い方のヒントを見る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 通常の入力フォーム画面
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Fitbitに食事を記録 (JSON入力)</h1>
      <p className="mb-4 text-gray-400">
        Geminiが出力した食事記録（JSON）を貼り付けて、「Fitbitに記録する」ボタンを押してください。
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="jsonInput"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Gemini出力JSON
          </label>

          {/* --- ツールバーエリア --- */}
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-300 bg-blue-900/30 border border-blue-800 rounded-md hover:bg-blue-900/50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              クリップボードから貼り付け
            </button>

            <button
              type="button"
              onClick={() => setJsonInput("")}
              className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
            >
              クリア
            </button>
          </div>
          {/* --- ツールバーエリアここまで --- */}

          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='ここにJSONを貼り付け... (例: { "meal_type": "Lunch", ... })'
            rows={15}
            className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 font-mono text-sm leading-relaxed"
            required
          />
        </div>

        {/* テンプレート読み込み（詳細エリアに格納） */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors select-none list-none flex items-center gap-2">
            <span className="transform group-open:rotate-90 transition-transform text-xs">
              ▶
            </span>
            開発用テンプレートを読み込む
          </summary>
          <div className="mt-2 pl-4">
            <button
              type="button"
              onClick={() => setJsonInput(generateTemplate())}
              className="text-xs text-blue-400 hover:underline"
            >
              サンプルデータを挿入する
            </button>
          </div>
        </details>

        <button
          type="submit"
          disabled={isLoading || !jsonInput}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-[0.99]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              記録中...
            </span>
          ) : (
            "Fitbitに記録する"
          )}
        </button>
      </form>

      {/* ステータスメッセージ表示エリア */}
      {statusMessage && (
        <div
          className={`mt-6 p-4 rounded-lg border-l-4 shadow-md transition-all duration-300 ${
            isError
              ? "bg-red-900/20 border-red-500 text-red-200"
              : "bg-green-900/20 border-green-500 text-green-200"
          }`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 whitespace-pre-wrap font-medium">
              {statusMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
