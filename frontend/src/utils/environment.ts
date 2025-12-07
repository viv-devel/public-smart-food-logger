/**
 * @file 環境変数に関連するユーティリティ関数を提供します。
 * @module frontend/utils/environment
 */

/**
 * 現在の実行環境（Production, Staging, Localなど）に基づいて、
 * UIのヘッダーに表示する背景色（Tailwind CSSのクラス名）を返します。
 *
 * この関数は、開発者が現在のデプロイ環境を一目で識別できるようにするためのものです。
 * 例えば、本番環境(PROD)は目立たないグレー、ステージング環境は警告色に近い黄色、
 * ローカル環境は青色といったように、環境ごとに異なる色が割り当てられています。
 *
 * @param {string} [environment] - 現在の環境を示す文字列。通常は `process.env.NEXT_PUBLIC_VERCEL_ENV` などの環境変数が渡されます。
 * @returns {string} Tailwind CSSの背景色クラス名 (例: "bg-gray-800")。
 */
export const getHeaderColor = (environment?: string) => {
  switch (environment) {
    case "PROD":
      return "bg-gray-800";
    case "staging":
      return "bg-yellow-700";
    case "preview":
      return "bg-purple-700";
    case "ci-test":
      return "bg-green-700";
    case "local":
      return "bg-blue-700";
    default:
      return "bg-red-700"; // Default color (e.g. for unknown env)
  }
};
