import { z } from "zod";

import { allNutritionFields } from "./common.js";

/**
 * Fitbit Create Food Log API のリクエストスキーマ
 * @see https://dev.fitbit.com/build/reference/web-api/nutrition/create-food-log/
 */

// 食事タイプのマッピング定義
export const MEAL_TYPE_MAP = {
  Breakfast: 1,
  "Morning Snack": 2,
  Lunch: 3,
  "Afternoon Snack": 4,
  Dinner: 5,
  Anytime: 7,
} as const;

// 食事タイプの列挙型 (数値)
export const MealTypeIdSchema = z.union([
  z.literal(MEAL_TYPE_MAP.Breakfast),
  z.literal(MEAL_TYPE_MAP["Morning Snack"]),
  z.literal(MEAL_TYPE_MAP.Lunch),
  z.literal(MEAL_TYPE_MAP["Afternoon Snack"]),
  z.literal(MEAL_TYPE_MAP.Dinner),
  z.literal(MEAL_TYPE_MAP.Anytime),
]);

// 基本的な必須フィールド
const baseFields = {
  mealTypeId: MealTypeIdSchema,
  unitId: z.string().min(1, "単位IDは必須です"),
  amount: z.number().positive("量は正の数である必要があります"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付は YYYY-MM-DD 形式である必要があります"),
  favorite: z.boolean().optional(),
};

// foodId/foodName 関連フィールド（すべてオプションとして定義し、superRefineで制御）
const itemFields = {
  foodId: z.string().optional(),
  foodName: z.string().optional(),
  brandName: z.string().optional(),
  calories: z.number().nonnegative().optional(),
  ...allNutritionFields,
};

/**
 * Fitbit Create Food Log API のリクエストスキーマ
 * foodId または foodName のどちらかが必須
 */
export const LogFoodBaseSchema = z.object({
  ...baseFields,
  ...itemFields,
});

export const LogFoodRequestSchema = LogFoodBaseSchema.superRefine(
  (data, ctx) => {
    // foodId も foodName もない場合はエラー
    if (data.foodId === undefined && data.foodName === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "foodId または foodName のいずれかが必須です",
        path: ["foodId"],
      });
      return;
    }

    // foodNameを指定して記録する場合、foodNameは空文字ではいけない
    if (data.foodName !== undefined && data.foodName.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "foodNameは必須です",
        path: ["foodName"],
      });
    }
  },
);

/**
 * Fitbit Create Food Log API のレスポンススキーマ
 */
export const LogFoodResponseSchema = z.object({
  foodLog: z.object({
    isFavorite: z.boolean().optional(),
    logId: z.number(),
    logDate: z.string(),
    loggedFood: z.object({
      foodId: z.number(),
      name: z.string(),
      amount: z.number(),
      unit: z.object({
        id: z.number(),
        name: z.string(),
        plural: z.string(),
      }),
      mealTypeId: z.number(),
      calories: z.number(),
      brand: z.string().optional(),
    }),
    nutritionalValues: z.record(z.string(), z.unknown()).optional(),
  }),
});

/**
 * Fitbit Create Food Log API のリクエスト型
 */
export type LogFoodRequest = z.infer<typeof LogFoodRequestSchema>;

/**
 * Fitbit Create Food Log API のレスポンス型
 */
export type LogFoodResponse = z.infer<typeof LogFoodResponseSchema>;

/**
 * MealTypeId 型
 */
export type MealTypeId = z.infer<typeof MealTypeIdSchema>;
