/**
 * @file Fitbit Create Food Log APIのスキーマと型定義です。
 * @module shared/external/fitbit/nutrition/logFood
 *
 * @description
 * このファイルは、Fitbitに食事ログを記録するためのAPI（Create Food Log）に関連する
 * リクエストとレスポンスのZodスキーマ、およびTypeScriptの型を定義します。
 *
 * このAPIは、Fitbitの公開データベースの食品（`foodId`を使用）または、
 * 未登録の食品（`foodName`と栄養素情報を直接指定）のいずれも記録することができます。
 *
 * @see https://dev.fitbit.com/build/reference/web-api/nutrition/create-food-log/
 */
import { z } from "zod";

import { allNutritionFields } from "./common.js";

/**
 * Fitbit APIが要求する食事タイプ名と、それに対応する数値IDのマッピングです。
 *
 * APIリクエストでは、食事の種類（朝食、昼食など）をこの数値IDで指定する必要があります。
 * 例えば、「Breakfast」は `1` になります。
 * `as const` を使用して、キーと値がTypeScript上で定数として扱われるようにし、型の安全性を高めています。
 */
export const MEAL_TYPE_MAP = {
  Breakfast: 1,
  "Morning Snack": 2,
  Lunch: 3,
  "Afternoon Snack": 4,
  Dinner: 5,
  Anytime: 7,
} as const;

/**
 * 食事タイプの数値IDを検証するZodスキーマです。
 * `MEAL_TYPE_MAP` に定義された数値リテラルのユニオン型として定義されており、
 * 有効な食事タイプIDのみを許可します。
 */
export const MealTypeIdSchema = z.union([
  z.literal(MEAL_TYPE_MAP.Breakfast),
  z.literal(MEAL_TYPE_MAP["Morning Snack"]),
  z.literal(MEAL_TYPE_MAP.Lunch),
  z.literal(MEAL_TYPE_MAP["Afternoon Snack"]),
  z.literal(MEAL_TYPE_MAP.Dinner),
  z.literal(MEAL_TYPE_MAP.Anytime),
]);

/**
 * 食事ログ記録APIリクエストの基本的なフィールドを定義します。
 * これには、食事タイプ、単位、量、日付などの必須情報が含まれます。
 */
const baseFields = {
  mealTypeId: MealTypeIdSchema,
  unitId: z.string().min(1, "単位IDは必須です"),
  amount: z.number().positive("量は正の数である必要があります"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付は YYYY-MM-DD 形式である必要があります"),
  favorite: z.boolean().optional(),
};

/**
 * 記録対象の食品アイテムに関連するフィールドを定義します。
 *
 * `foodId` を使ってFitbitの既存食品を指定するか、
 * `foodName` と栄養素情報を使って新しい食品情報を直接指定するかのいずれかの方法で利用します。
 * どちらが必須かは `LogFoodRequestSchema` の `superRefine` で検証されるため、ここでは全てオプショナルです。
 */
const itemFields = {
  foodId: z.string().optional(),
  foodName: z.string().optional(),
  brandName: z.string().optional(),
  calories: z.number().nonnegative().optional(),
  ...allNutritionFields,
};

/**
 * Create Food Log APIリクエストの基本的な構造を定義するZodスキーマです。
 *
 * このスキーマは、必須フィールド(`baseFields`)と食品情報(`itemFields`)を結合したものですが、
 * `foodId`と`foodName`の相互依存関係（どちらか一方が必須）の検証はまだ行っていません。
 * 実際のバリデーションは、このスキーマを拡張した`LogFoodRequestSchema`で行われます。
 */
export const LogFoodBaseSchema = z.object({
  ...baseFields,
  ...itemFields,
});

/**
 * Create Food Log APIリクエストの完全なZodスキーマです。
 *
 * `LogFoodBaseSchema`をベースに、`superRefine`を用いて高度なカスタムバリデーションを実装しています。
 *
 * ### 検証ルール
 * 1. `foodId`と`foodName`のどちらか一方は必ず指定されなければならない。
 * 2. `foodName`が指定された場合、その文字列は空であってはならない。
 *
 * これにより、APIが要求する複雑な条件を満たすリクエストのみを許可します。
 */
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
 * Create Food Log APIからのレスポンスボディを検証するZodスキーマです。
 *
 * APIが成功すると、記録された食事ログの詳細情報が`foodLog`オブジェクトとして返されます。
 * このスキーマは、その構造（ログID、食品情報、栄養価など）を定義します。
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
 * Create Food Log API へのリクエストボディの型。
 * `LogFoodRequestSchema` から自動生成されます。
 */
export type LogFoodRequest = z.infer<typeof LogFoodRequestSchema>;

/**
 * Create Food Log API からのレスポンスボディの型。
 * `LogFoodResponseSchema` から自動生成されます。
 */
export type LogFoodResponse = z.infer<typeof LogFoodResponseSchema>;

/**
 * 食事タイプの数値IDを表す型。
 * `MealTypeIdSchema` から自動生成されます。
 */
export type MealTypeId = z.infer<typeof MealTypeIdSchema>;
