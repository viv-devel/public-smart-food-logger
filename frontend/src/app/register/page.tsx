"use client";

import Link from "next/link";
import { FormEvent } from "react";

import { useFitbitLogger } from "@/hooks/useFitbitLogger";
import { generateTemplate } from "@/utils/fitbitTemplate";

export default function FitbitViaGeminiRegisterPage() {
  const {
    jsonInput,
    setJsonInput,
    isLoading,
    statusMessage,
    setStatusMessage,
    isError,
    handleSubmit,
  } = useFitbitLogger();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const result = await handleSubmit(event);
    if (result && result.success) {
      setStatusMessage(
        <>
          <p>{result.message || "Fitbitへの記録が完了しました！"}</p>
          <Link
            href="/tips"
            className="text-blue-400 hover:underline mt-2 inline-block"
          >
            → より便利な使い方のヒントはこちら
          </Link>
        </>,
      );
    }
  };

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

          {/* --- ボタンエリア --- */}
          <div className="flex justify-end space-x-2 mb-2">
            <button
              type="button"
              onClick={() => setJsonInput(generateTemplate())}
              className="px-3 py-1 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              テンプレートを読み込む
            </button>
            <button
              type="button"
              onClick={() => setJsonInput("")}
              className="px-3 py-1 text-sm text-red-400 bg-gray-700 rounded-md hover:bg-red-900/50 transition-colors"
            >
              クリア
            </button>
          </div>
          {/* --- ボタンエリアここまで --- */}

          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="ここにJSONを貼り付け..."
            rows={20}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 font-mono text-xs"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !jsonInput}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? "記録中..." : "Fitbitに記録する"}
        </button>
      </form>

      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-center font-semibold whitespace-pre-wrap ${isError ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}
        >
          <p>{statusMessage}</p>
        </div>
      )}
    </div>
  );
}
