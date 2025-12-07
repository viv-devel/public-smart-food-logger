/**
 * @file `@smart-food-logger/shared` パッケージのエントリーポイントです。
 * @module shared
 *
 * @description
 * このパッケージは、モノレポ内の `frontend` と `backend` の両方で共通して使用される
 * ZodスキーマやTypeScriptの型定義をを提供します。
 *
 * 主に以下の役割を担います:
 * - **外部APIスキーマ**: Fitbit APIなど、外部サービスのAPIリクエスト・レスポンスの型定義。
 * - **内部APIスキーマ**: このアプリケーション独自のAPI（フロントエンドとバックエンド間の通信）の型定義。
 *
 * これにより、プロジェクト全体でのデータ構造の一貫性を保ち、型安全性を向上させます。
 */

export * from "./external/fitbit/nutrition/common.js";
export * from "./external/fitbit/nutrition/createFood.js";
export * from "./external/fitbit/nutrition/logFood.js";
export * from "./schema/api/common.js";
export * from "./schema/api/createFoodLogRequest.js";
