"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FC, useState } from "react";

import { AppLinks } from "@/components/AppLinks";
import {
  GEM_DESCRIPTION,
  GEM_NAME,
  GEMINI_INSTRUCTIONS,
  SHARED_GEM_URL,
} from "@/constants/gemini";

interface CopyableFieldProps {
  label: string;
  value: string;
  isTextArea?: boolean;
}

/**
 * クリップボードコピー機能付きフィールドコンポーネント。
 *
 * ラベルと値を表示し、ボタンクリックで値をクリップボードにコピーする機能を提供する。
 * 長文の場合はテキストエリア形式での表示もサポートする。
 *
 * @param label - フィールドのラベル。
 * @param value - 表示およびコピー対象の値。
 * @param isTextArea - trueの場合、inputではなくスクロール可能なpreタグで表示する（長文用）。
 */
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

/**
 * カスタムGemini設定手順ページコンポーネント。
 *
 * ユーザーに対して、Fitbit連携に必要なカスタムGeminiの作成手順、および必要なプロンプト（指示）を提供する。
 * 各設定値はワンクリックでコピーできるようになっている。
 */
export default function InstructionsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">カスタムGemini 設定手順</h1>

      <div className="mb-12 p-8 bg-linear-to-br from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          👋 すぐに始めたい方へ (推奨)
        </h2>
        <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
          面倒な設定は不要です。事前設定済みのAI「Smart Food Logger
          AI」を使えば、今すぐ食事記録を開始できます。
        </p>
        <a
          href={SHARED_GEM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          Smart Food Logger AI を使う
        </a>
        <p className="text-sm text-gray-400 mt-4">
          ※Googleアカウントへのログインが必要です
        </p>
      </div>

      <div className="mb-12">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 py-3 px-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors text-left"
        >
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            ▶
          </motion.span>
          <span className="font-medium text-gray-300">
            自分でGemを作成したい方 (手順を表示)
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-6 pl-4 border-l-2 border-gray-700 space-y-8">
                <p className="text-gray-400 text-sm">
                  ※以下の設定内容は、上記の共有カスタムGemと同一です。
                  ご自身のGoogleアカウントで管理したい場合や、カスタマイズしたい場合にご利用ください。
                </p>

                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <h2 className="text-2xl font-bold mb-3">1. 準備するもの</h2>
                  <ul className="list-disc list-inside space-y-3 text-gray-300">
                    <li>
                      <strong>Googleアカウント:</strong>{" "}
                      カスタムGeminiの作成に必須です。
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
                      <strong>Fitbitアカウント:</strong>{" "}
                      食事の記録先に必須です。
                    </li>
                  </ul>
                  <p className="text-sm text-gray-400 mt-3">
                    ※Geminiの有料プラン（Gemini
                    Advanced）は必須ではありませんが、無料版には利用制限がある点にご注意ください。
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <h2 className="text-2xl font-bold mb-3">
                    2. カスタムGeminiの作成
                  </h2>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
