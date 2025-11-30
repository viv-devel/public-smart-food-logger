import { z } from "zod";

/**
 * Fitbit Nutrition API で共通利用される型定義
 */

/**
 * 一般的な栄養素フィールド（オプション）
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
 * ビタミンフィールド（オプション）
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
 * ミネラルフィールド（オプション）
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
 * 全ての栄養素フィールドを含むオブジェクト
 */
export const allNutritionFields = {
  ...commonNutritionFields,
  ...vitaminFields,
  ...mineralFields,
};
