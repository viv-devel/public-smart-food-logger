/**
 * @file Fitbit Create Food APIのスキーマと型定義です。
 * @module shared/external/fitbit/nutrition/createFood
 *
 * @description
 * このファイルは、Fitbitのプライベートフードデータベースに新しい食品を登録するためのAPI（Create Food）に関連する
 * リクエストとレスポンスのZodスキーマ、およびTypeScriptの型を定義します。
 *
 * ユーザーが記録したい食品がFitbitの公開データベースに存在しない場合、
 * このAPIを利用して自身のプライベートデータベースに食品を追加した上で、食事ログを記録する必要があります。
 *
 * @see https://dev.fitbit.com/build/reference/web-api/nutrition/create-food/
 */
import { z } from "zod";

import { allNutritionFields } from "./common.js";

/**
 * 食品の形状（formType）を表すZodスキーマです。
 * Fitbit APIでは、食品が液体か固体かを "LIQUID" または "DRY" で指定します。
 */
export const FormTypeSchema = z.enum(["LIQUID", "DRY"]);

// 必須フィールド
const requiredFields = {
  name: z.string().min(1, "食品名は必須です"),
  defaultFoodMeasurementUnitId: z
    .string()
    .min(1, "デフォルト測定単位IDは必須です"),
  defaultServingSize: z
    .number()
    .positive("デフォルトサービングサイズは正の数である必要があります"),
  calories: z.number().nonnegative("カロリーは0以上である必要があります"),
  formType: FormTypeSchema,
  description: z.string().min(1, "説明は必須です"),
};

/**
 * Fitbit Create Food API へのリクエストボディのZodスキーマです。
 *
 * 新規食品を登録するために必要な必須フィールド（`name`, `calories`など）と、
 * `allNutritionFields` からインポートした詳細な栄養素フィールドで構成されます。
 */
export const CreateFoodRequestSchema = z.object({
  ...requiredFields,
  ...allNutritionFields,
});

/**
 * Fitbit Create Food API からのレスポンスボディのZodスキーマです。
 *
 * @remarks
 * 公式ドキュメントではレスポンスの `food` オブジェクトの詳細な型が明記されていませんが、
 * 実際のAPIレスポンス（および`fitbitService.ts`の実装）に基づき、
 * 新規作成された食品の`foodId`と`name`を含むオブジェクトとして定義しています。
 * `units` フィールドは存在が確認されていますが、詳細な型が不明なためオプショナルな配列としています。
 */
export const CreateFoodResponseSchema = z.object({
  food: z.object({
    foodId: z.number(),
    name: z.string(),
    units: z.array(z.number()).optional(), // 詳細な構造は不明だがIDの配列かオブジェクトの配列
    // 必要に応じてフィールドを追加
  }),
});

/**
 * Fitbit Create Food API へのリクエストボディの型。
 * `CreateFoodRequestSchema` から自動生成されます。
 */
export type CreateFoodRequest = z.infer<typeof CreateFoodRequestSchema>;

/**
 * Fitbit Create Food API からのレスポンスボディの型。
 * `CreateFoodResponseSchema` から自動生成されます。
 */
export type CreateFoodResponse = z.infer<typeof CreateFoodResponseSchema>;

/**
 * 食品の形状（`LIQUID` または `DRY`）を表す型。
 * `FormTypeSchema` から自動生成されます。
 */
export type FormType = z.infer<typeof FormTypeSchema>;
