/**
 * @file このアプリケーション独自の食事ログ作成リクエストのスキーマを定義します。
 * @module shared/schema/api/createFoodLogRequest
 *
 * @description
 * このファイルは、フロントエンドからサーバーサイドへ食事ログ作成をリクエストする際の
 * データ構造（ペイロード）をZodスキーマとして定義します。
 *
 * Fitbit APIの`Create Food`と`Log Food`は個別に行う必要がありますが、このアプリケーションでは
 * UI/UX向上のため、それらを一つのリクエストに抽象化しています。
 * このスキーマは、その抽象化されたリクエストの形式を定義するものです。
 *
 * バックエンドは、このリクエストを受け取った後、各食品アイテムをFitbitのプライベートフードとして登録し（Create Food）、
 * その後、食事ログとして記録する（Log Food）という一連の処理を実行します。
 */
import { z } from "zod";

import { CreateFoodRequestSchema } from "../../external/fitbit/nutrition/createFood.js";
import {
  LogFoodBaseSchema,
  MEAL_TYPE_MAP,
} from "../../external/fitbit/nutrition/logFood.js";

const createFoodShape = CreateFoodRequestSchema.shape;
const logFoodShape = LogFoodBaseSchema.shape;

/**
 * 食事タイプのキー名（"Breakfast", "Lunch"など）を検証するZodスキーマです。
 *
 * `MEAL_TYPE_MAP`のキーをenumとして利用することで、不正な食事タイプ名が
 * リクエストに含まれることを防ぎます。
 */
const MealTypeKeySchema = z.enum(
  Object.keys(MEAL_TYPE_MAP) as [
    keyof typeof MEAL_TYPE_MAP,
    ...Array<keyof typeof MEAL_TYPE_MAP>,
  ],
);

/**
 * ログ記録される個々の食品アイテムを表すZodスキーマです。
 *
 * このスキーマは、Fitbitの`Create Food` API（食品名、カロリー、栄養素など）と
 * `Log Food` API（量、単位など）の両方で必要とされる情報を統合しています。
 *
 * 例えば、`foodName`は`CreateFoodRequestSchema`から、`amount`は`LogFoodBaseSchema`から
 * それぞれのスキーマ定義を再利用しており、一貫性を保っています。
 *
 * 栄養素フィールドのキー名には、Geminiからの出力との整合性を考慮し、
 * またバックエンドでの単位変換処理を明確にするため、`_g`, `_mg` といった単位サフィックスが付与されています。
 * これは`CreateFoodRequestSchema`から参照しているフィールド名に由来します。
 */
export const FoodItemSchema = z.object({
  /**
   * 食品名。Fitbitのプライベートフードとして登録される名前です。
   * (CreateFoodRequestSchema.shape.name を再利用)
   */
  foodName: createFoodShape.name,
  /**
   * 摂取量。
   * (LogFoodBaseSchema.shape.amount を再利用)
   */
  amount: logFoodShape.amount,
  /**
   * 摂取量の単位。Gemini APIからの出力では 'g', 'ml', 'serving' などが想定されます。
   * バックエンドでFitbit APIが要求する単位IDに変換されます。
   */
  unit: z.string().min(1),
  /**
   * 総カロリー。
   * (CreateFoodRequestSchema.shape.calories を再利用)
   */
  calories: createFoodShape.calories,
  /**
   * 食品の形状（液体か固体か）。
   * (CreateFoodRequestSchema.shape.formType を再利用)
   */
  formType: createFoodShape.formType.optional(),
  /**
   * 食品の説明。
   * (CreateFoodRequestSchema.shape.description を再利用)
   */
  description: createFoodShape.description.optional(),

  // 栄養素フィールド: CreateFoodRequestSchemaから型定義を再利用。
  // キー名には、Geminiからの出力形式との互換性を保つため、単位サフィックス（_g, _mgなど）が付与されています。
  // 例えば、このスキーマの `totalFat_g` は、`CreateFoodRequestSchema` の `totalFat` の型定義を利用しています。
  // バックエンドは、これらのフィールドを受け取った後、サフィックスを除去してFitbit APIの形式に変換します。

  /** 脂肪由来カロリー */
  caloriesFromFat: createFoodShape.caloriesFromFat,
  /** 総脂質 (g)。キー名は `totalFat_g` */
  totalFat_g: createFoodShape.totalFat,
  /** トランス脂肪酸 (g)。キー名は `transFat_g` */
  transFat_g: createFoodShape.transFat,
  /** 飽和脂肪酸 (g)。キー名は `saturatedFat_g` */
  saturatedFat_g: createFoodShape.saturatedFat,
  /** コレステロール (mg)。キー名は `cholesterol_mg` */
  cholesterol_mg: createFoodShape.cholesterol,
  /** ナトリウム (mg)。キー名は `sodium_mg` */
  sodium_mg: createFoodShape.sodium,
  /** カリウム (mg)。キー名は `potassium_mg` */
  potassium_mg: createFoodShape.potassium,
  /** 総炭水化物 (g)。キー名は `totalCarbohydrate_g` */
  totalCarbohydrate_g: createFoodShape.totalCarbohydrate,
  /** 食物繊維 (g)。キー名は `dietaryFiber_g` */
  dietaryFiber_g: createFoodShape.dietaryFiber,
  /** 糖質 (g)。キー名は `sugars_g` */
  sugars_g: createFoodShape.sugars,
  /** タンパク質 (g)。キー名は `protein_g` */
  protein_g: createFoodShape.protein,

  // ビタミン類
  /** ビタミンA (IU)。キー名は `vitaminA_iu` */
  vitaminA_iu: createFoodShape.vitaminA,
  /** ビタミンB6。キー名は `vitaminB6` */
  vitaminB6: createFoodShape.vitaminB6,
  /** ビタミンB12。キー名は `vitaminB12` */
  vitaminB12: createFoodShape.vitaminB12,
  /** ビタミンC (mg)。キー名は `vitaminC_mg` */
  vitaminC_mg: createFoodShape.vitaminC,
  /** ビタミンD (IU)。キー名は `vitaminD_iu` */
  vitaminD_iu: createFoodShape.vitaminD,
  /** ビタミンE (IU)。キー名は `vitaminE_iu` */
  vitaminE_iu: createFoodShape.vitaminE,
  /** ビオチン (mg)。キー名は `biotin_mg` */
  biotin_mg: createFoodShape.biotin,
  /** 葉酸 (mg)。キー名は `folicAcid_mg` */
  folicAcid_mg: createFoodShape.folicAcid,
  /** ナイアシン (mg)。キー名は `niacin_mg` */
  niacin_mg: createFoodShape.niacin,
  /** パントテン酸 (mg)。キー名は `pantothenicAcid_mg` */
  pantothenicAcid_mg: createFoodShape.pantothenicAcid,
  /** リボフラビン (mg)。キー名は `riboflavin_mg` */
  riboflavin_mg: createFoodShape.riboflavin,
  /** チアミン (mg)。キー名は `thiamin_mg` */
  thiamin_mg: createFoodShape.thiamin,

  // ミネラル類
  /** カルシウム (g)。キー名は `calcium_g` */
  calcium_g: createFoodShape.calcium,
  /** 銅 (g)。キー名は `copper_g` */
  copper_g: createFoodShape.copper,
  /** 鉄 (mg)。キー名は `iron_mg` */
  iron_mg: createFoodShape.iron,
  /** マグネシウム (mg)。キー名は `magnesium_mg` */
  magnesium_mg: createFoodShape.magnesium,
  /** リン (g)。キー名は `phosphorus_g` */
  phosphorus_g: createFoodShape.phosphorus,
  /** ヨウ素 (mcg)。キー名は `iodine_mcg` */
  iodine_mcg: createFoodShape.iodine,
  /** 亜鉛 (mg)。キー名は `zinc_mg` */
  zinc_mg: createFoodShape.zinc,
});

/**
 * ログ記録される個々の食品アイテムの型。
 * `FoodItemSchema`から自動生成されます。
 */
export type FoodItem = z.infer<typeof FoodItemSchema>;

/**
 * アプリケーション独自の食事ログ作成リクエスト全体のZodスキーマです。
 *
 * フロントエンドから送信される、食事全体の情報を定義します。
 * 複数の`FoodItem`の配列と、食事の日時、食事タイプで構成されます。
 */
export const CreateFoodLogRequestSchema = z.object({
  /** 記録対象の食品アイテムのリスト。 */
  foods: z.array(FoodItemSchema),
  /** 食事ログの日付 (YYYY-MM-DD形式)。 (LogFoodBaseSchema.shape.date を再利用) */
  log_date: logFoodShape.date,
  /**
   * 食事ログの時刻 (HH:MM:SS形式)。
   * @remarks Fitbit APIには直接時刻を記録するフィールドが存在しないため、
   * これはアプリケーション独自の拡張フィールドです。将来的な機能拡張のために保持されます。
   */
  log_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  /** 食事タイプ名 ("Breakfast", "Lunch"など)。 */
  meal_type: MealTypeKeySchema,
  /**
   * ユーザーID (オプション)。
   * @remarks 現在の実装では使用されていませんが、将来的にマルチユーザー対応する際の拡張用フィールドです。
   */
  userId: z.string().optional(),
});

/**
 * アプリケーション独自の食事ログ作成リクエストの型。
 * `CreateFoodLogRequestSchema`から自動生成されます。
 */
export type CreateFoodLogRequest = z.infer<typeof CreateFoodLogRequestSchema>;
