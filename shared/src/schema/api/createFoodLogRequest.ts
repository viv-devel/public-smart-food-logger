import { z } from "zod";

import { CreateFoodRequestSchema } from "../../external/fitbit/nutrition/createFood.js";
import {
  LogFoodBaseSchema,
  MEAL_TYPE_MAP,
} from "../../external/fitbit/nutrition/logFood.js";

const createFoodShape = CreateFoodRequestSchema.shape;
const logFoodShape = LogFoodBaseSchema.shape;

// MEAL_TYPE_MAP のキーを取得して型安全な enum を作成
const MealTypeKeySchema = z.enum(
  Object.keys(MEAL_TYPE_MAP) as [
    keyof typeof MEAL_TYPE_MAP,
    ...Array<keyof typeof MEAL_TYPE_MAP>,
  ],
);

/**
 * 食品アイテムのスキーマ
 * FitbitのCreateFood APIとLogFood APIの両方の要素を組み合わせて定義
 */
export const FoodItemSchema = z.object({
  /** 食品名 (CreateFoodRequestSchemaより) */
  foodName: createFoodShape.name,
  /** 量 (LogFoodBaseSchemaより) */
  amount: logFoodShape.amount,
  /** 単位 (文字列) */
  unit: z.string().min(1),
  /** カロリー (CreateFoodRequestSchemaより) */
  calories: createFoodShape.calories,
  /** 形状タイプ (LIQUID/DRY, オプション) */
  formType: createFoodShape.formType.optional(),
  /** 説明 (オプション) */
  description: createFoodShape.description.optional(),

  // Common Nutrition Fields - Mapped from CreateFoodRequestSchema
  /** 脂肪からのカロリー */
  caloriesFromFat: createFoodShape.caloriesFromFat,
  /** 総脂質 (g) */
  totalFat_g: createFoodShape.totalFat,
  /** トランス脂肪酸 (g) */
  transFat_g: createFoodShape.transFat,
  /** 飽和脂肪酸 (g) */
  saturatedFat_g: createFoodShape.saturatedFat,
  /** コレステロール (mg) */
  cholesterol_mg: createFoodShape.cholesterol,
  /** ナトリウム (mg) */
  sodium_mg: createFoodShape.sodium,
  /** カリウム (mg) */
  potassium_mg: createFoodShape.potassium,
  /** 総炭水化物 (g) */
  totalCarbohydrate_g: createFoodShape.totalCarbohydrate,
  /** 食物繊維 (g) */
  dietaryFiber_g: createFoodShape.dietaryFiber,
  /** 糖質 (g) */
  sugars_g: createFoodShape.sugars,
  /** タンパク質 (g) */
  protein_g: createFoodShape.protein,

  // Vitamins
  /** ビタミンA (IU) */
  vitaminA_iu: createFoodShape.vitaminA,
  /** ビタミンB6 */
  vitaminB6: createFoodShape.vitaminB6,
  /** ビタミンB12 */
  vitaminB12: createFoodShape.vitaminB12,
  /** ビタミンC (mg) */
  vitaminC_mg: createFoodShape.vitaminC,
  /** ビタミンD (IU) */
  vitaminD_iu: createFoodShape.vitaminD,
  /** ビタミンE (IU) */
  vitaminE_iu: createFoodShape.vitaminE,
  /** ビオチン (mg) */
  biotin_mg: createFoodShape.biotin,
  /** 葉酸 (mg) */
  folicAcid_mg: createFoodShape.folicAcid,
  /** ナイアシン (mg) */
  niacin_mg: createFoodShape.niacin,
  /** パントテン酸 (mg) */
  pantothenicAcid_mg: createFoodShape.pantothenicAcid,
  /** リボフラビン (mg) */
  riboflavin_mg: createFoodShape.riboflavin,
  /** チアミン (mg) */
  thiamin_mg: createFoodShape.thiamin,

  // Minerals
  /** カルシウム (g) */
  calcium_g: createFoodShape.calcium,
  /** 銅 (g) */
  copper_g: createFoodShape.copper,
  /** 鉄 (mg) */
  iron_mg: createFoodShape.iron,
  /** マグネシウム (mg) */
  magnesium_mg: createFoodShape.magnesium,
  /** リン (g) */
  phosphorus_g: createFoodShape.phosphorus,
  /** ヨウ素 (mcg) */
  iodine_mcg: createFoodShape.iodine,
  /** 亜鉛 (mg) */
  zinc_mg: createFoodShape.zinc,
});

/**
 * 食品アイテムの型定義
 */
export type FoodItem = z.infer<typeof FoodItemSchema>;

/**
 * 食事ログ作成リクエストのスキーマ
 * 複数の食品アイテムとログ日時、食事タイプを含む
 */
export const CreateFoodLogRequestSchema = z.object({
  /** 食品アイテムのリスト */
  foods: z.array(FoodItemSchema),
  /** ログ日付 (YYYY-MM-DD) */
  log_date: logFoodShape.date,
  /** ログ時刻 (HH:MM:SS) */ // TODO: Fitbit側には存在しない
  log_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  /** 食事タイプ (Breakfast, Lunch, Dinner, etc.) */
  meal_type: MealTypeKeySchema,
  /** ユーザーID (オプション) */
  userId: z.string().optional(),
});

/**
 * 食事ログ作成リクエストの型定義
 */
export type CreateFoodLogRequest = z.infer<typeof CreateFoodLogRequestSchema>;
