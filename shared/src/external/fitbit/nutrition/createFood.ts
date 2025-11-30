import { z } from "zod";

import { allNutritionFields } from "./common.js";

/**
 * Fitbit Create Food API のリクエストスキーマ
 * @see https://dev.fitbit.com/build/reference/web-api/nutrition/create-food/
 */

// formType の列挙型
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
 * Fitbit Create Food API のリクエストスキーマ
 */
export const CreateFoodRequestSchema = z.object({
  ...requiredFields,
  ...allNutritionFields,
});

/**
 * Fitbit Create Food API のレスポンススキーマ
 * 注意: 公式ドキュメントと異なり、実際には 'food' オブジェクトが返される（fitbitService.tsの実装に基づく）
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
 * Fitbit Create Food API のリクエスト型
 */
export type CreateFoodRequest = z.infer<typeof CreateFoodRequestSchema>;

/**
 * Fitbit Create Food API のレスポンス型
 */
export type CreateFoodResponse = z.infer<typeof CreateFoodResponseSchema>;

/**
 * FormType 型
 */
export type FormType = z.infer<typeof FormTypeSchema>;
