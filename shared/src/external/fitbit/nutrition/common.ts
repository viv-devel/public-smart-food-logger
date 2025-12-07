import { z } from "zod";

/**
 * @file Fitbit Nutrition APIで共通利用される栄養素関連の型定義です。
 * @module shared/external/fitbit/nutrition/common
 *
 * @description
 * このファイルは、Fitbitの食品登録や食事ログで使用される栄養素フィールドをZodスキーマとして定義します。
 * 栄養素は「一般的な栄養素」「ビタミン」「ミネラル」の3つのカテゴリに分類され、
 * `allNutritionFields` ですべてがマージされます。
 *
 * 各フィールドはオプションかつ非負数(`nonnegative().optional()`)として定義されており、
 * データが不足している場合でも柔軟に扱えるようになっています。
 * コメントにはFitbit APIで想定されている単位（g, mg, IUなど）を記載しています。
 */

/**
 * 食品に含まれる一般的な栄養素のZodスキーマ定義です。
 * 脂質、炭水化物、タンパク質などが含まれます。
 */
export const commonNutritionFields = {
  caloriesFromFat: z.number().nonnegative().optional(),
  totalFat: z.number().nonnegative().optional(), // g
  transFat: z.number().nonnegative().optional(), // g
  saturatedFat: z.number().nonnegative().optional(), // g
  cholesterol: z.number().nonnegative().optional(), // mg
  sodium: z.number().nonnegative().optional(), // mg
  potassium: z.number().nonnegative().optional(), // mg
  totalCarbohydrate: z.number().nonnegative().optional(), // g
  dietaryFiber: z.number().nonnegative().optional(), // g
  sugars: z.number().nonnegative().optional(), // g
  protein: z.number().nonnegative().optional(), // g
};

/**
 * 食品に含まれるビタミン類のZodスキーマ定義です。
 */
export const vitaminFields = {
  vitaminA: z.number().nonnegative().optional(), // IU
  vitaminB6: z.number().nonnegative().optional(),
  vitaminB12: z.number().nonnegative().optional(),
  vitaminC: z.number().nonnegative().optional(), // mg
  vitaminD: z.number().nonnegative().optional(), // IU
  vitaminE: z.number().nonnegative().optional(), // IU
  biotin: z.number().nonnegative().optional(), // mg
  folicAcid: z.number().nonnegative().optional(), // mg
  niacin: z.number().nonnegative().optional(), // mg
  pantothenicAcid: z.number().nonnegative().optional(), // mg
  riboflavin: z.number().nonnegative().optional(), // mg
  thiamin: z.number().nonnegative().optional(), // mg
};

/**
 * 食品に含まれるミネラル類のZodスキーマ定義です。
 */
export const mineralFields = {
  calcium: z.number().nonnegative().optional(), // g
  copper: z.number().nonnegative().optional(), // g
  iron: z.number().nonnegative().optional(), // mg
  magnesium: z.number().nonnegative().optional(), // mg
  phosphorus: z.number().nonnegative().optional(), // g
  iodine: z.number().nonnegative().optional(), // mcg
  zinc: z.number().nonnegative().optional(), // mg
};

/**
 * `commonNutritionFields`, `vitaminFields`, `mineralFields` をすべて結合した、
 * 包括的な栄養素スキーマ定義です。
 * これにより、Fitbit APIでサポートされるすべての栄養素フィールドを一度に扱うことができます。
 */
export const allNutritionFields = {
  ...commonNutritionFields,
  ...vitaminFields,
  ...mineralFields,
};
