"use client";

import Link from "next/link";
import { FC, useState } from "react";

import { AppLinks } from "@/components/AppLinks";
import {
  GEM_DESCRIPTION,
  GEM_NAME,
  GEMINI_INSTRUCTIONS,
} from "@/constants/gemini";

interface CopyableFieldProps {
  label: string;
  value: string;
  isTextArea?: boolean;
}

const CopyableField: FC<CopyableFieldProps> = ({
  label,
  value,
  isTextArea = false,
}) => {
  const [buttonText, setButtonText] = useState("コピー");

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setButtonText("コピー完了!");
        setTimeout(() => {
          setButtonText("コピー");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setButtonText("失敗");
      });
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold text-gray-200 mb-2">
        {label}
      </label>
      <div className="relative">
        {isTextArea ? (
          <pre className="text-white whitespace-pre-wrap p-4 text-sm bg-gray-800 rounded-md border border-gray-700 overflow-x-auto max-h-60 overflow-y-auto">
            <code>{value}</code>
          </pre>
        ) : (
          <input
            type="text"
            value={value}
            readOnly
            className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-md py-2 px-3"
          />
        )}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 text-sm"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default function InstructionsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">カスタムGemini 設定手順</h1>

      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-3">1. 準備するもの</h2>
        <ul className="list-disc list-inside space-y-3 text-gray-300">
          <li>
            <strong>Googleアカウント:</strong> カスタムGeminiの作成に必須です。
            <a
              href="https://accounts.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline ml-2"
            >
              アカウント作成/ログイン
            </a>
          </li>
          <li>
            <strong>Fitbitアカウント:</strong> 食事の記録先に必須です。
          </li>
        </ul>
        <p className="text-sm text-gray-400 mt-3">
          ※Geminiの有料プラン（Gemini
          Advanced）は必須ではありませんが、無料版には利用制限がある点にご注意ください。
        </p>
      </div>

      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-3">2. カスタムGeminiの作成</h2>
        <p className="text-gray-300 mb-4">
          以下のリンクからカスタムGeminiの作成ページに移動し、「Gem
          を作成」ボタンを押して設定を開始します。
        </p>
        <a
          href="https://gemini.google.com/gems/view"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          カスタムGemini一覧ページへ
        </a>
        <p className="text-xs text-gray-400 mt-3">
          ※初めてGeminiを利用する場合、利用規約への同意が求められ、トップページに移動することがあります。その場合は、お手数ですが再度このページの「カスタムGemini一覧ページへ」ボタンを押してください。
        </p>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">
          3. 設定内容のコピー＆ペースト
        </h2>
        <p className="text-gray-300 mb-6">
          作成画面の各項目に、以下の内容をコピーして貼り付けてください。
        </p>
        <CopyableField label="名前" value={GEM_NAME} />
        <CopyableField label="説明" value={GEM_DESCRIPTION} />
        <CopyableField
          label="指示"
          value={GEMINI_INSTRUCTIONS}
          isTextArea={true}
        />
      </div>

      <hr className="my-12 border-gray-700" />

      <div data-testid="advanced-usage-section">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">応用編：便利な使い方</h2>
          <p className="text-gray-400 mt-2">
            初期設定完了後、よりスムーズに食事を記録するためのヒントです。
          </p>
        </div>

        <AppLinks />
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          アプリに戻る
        </Link>
      </div>
    </div>
  );
}
