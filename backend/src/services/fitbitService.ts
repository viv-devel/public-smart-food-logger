import {
  type CreateFoodLogRequest,
  type CreateFoodResponse,
  type FoodItem,
  type LogFoodResponse,
  MEAL_TYPE_MAP,
  type MealTypeId,
} from "@smart-food-logger/shared";
import { Buffer } from "buffer";
import fetch from "node-fetch";

import {
  getTokensFromFirestore,
  saveTokensToFirestore,
} from "../repositories/firebaseRepository.js";
import {
  AuthenticationError,
  FitbitApiError,
  ValidationError,
} from "../utils/errors.js";

// 栄養素のキーを、sharedパッケージで定義されたFoodItemのキーからFitbit APIのパラメータ名に変換する。
const NUTRITION_MAP: { [key: string]: string } = {
  caloriesFromFat: "caloriesFromFat",
  totalFat_g: "totalFat",
  transFat_g: "transFat",
  saturatedFat_g: "saturatedFat",
  cholesterol_mg: "cholesterol",
  sodium_mg: "sodium",
  potassium_mg: "potassium",
  totalCarbohydrate_g: "totalCarbohydrate",
  dietaryFiber_g: "dietaryFiber",
  sugars_g: "sugars",
  protein_g: "protein",
  vitaminA_iu: "vitaminA",
  vitaminB6: "vitaminB6",
  vitaminB12: "vitaminB12",
  vitaminC_mg: "vitaminC",
  vitaminD_iu: "vitaminD",
  vitaminE_iu: "vitaminE",
  biotin_mg: "biotin",
  folicAcid_mg: "folicAcid",
  niacin_mg: "niacin",
  pantothenicAcid_mg: "pantothenicAcid",
  riboflavin_mg: "riboflavin",
  thiamin_mg: "thiamin",
  calcium_g: "calcium",
  copper_g: "copper",
  iron_mg: "iron",
  magnesium_mg: "magnesium",
  phosphorus_g: "phosphorus",
  iodine_mcg: "iodine",
  zinc_mg: "zinc",
};

/**
 * 文字列の単位（"g", "ml"など）をFitbit APIが要求する数値IDに変換します。
 * マッピングに存在しない単位が来た場合は、汎用的な「serving」をデフォルト値として使用し、警告をログに出力します。
 * @param unit 変換する単位の文字列。
 * @returns 対応するFitbitの単位ID。
 */
export const getUnitId = (unit: string): number => {
  // 頻出する単位とそのバリエーションをFitbitのIDにマッピング
  // Reference: Fitbit API `get-food-units` endpoint (Retrieved 2025-12-29 with Accept-Locale: ja_JP)
  // See: backend/units_master.tsv for full list
  const unitMap: { [key: string]: number } = {
    g: 147, // gram (ID: 147)
    gram: 147,
    grams: 147,
    ml: 209, // milliliter (ID: 209)
    milliliter: 209,
    milliliters: 209,
    oz: 13, // ounce (ID: 13)
    "fl oz": 19, // fluidounce (ID: 19)
    cup: 91, // cup (ID: 91)
    serving: 304, // serving / 食分 (ID: 304)
    servings: 304,
    "1食分": 304,
    人前: 304,
    個: 304, // "個" often implies 1 serving. Physical unit ID is 5, but 304 is safer for generic pieces.
  };
  const lowerCaseUnit = unit ? unit.toLowerCase() : "";
  if (unitMap[lowerCaseUnit]) return unitMap[lowerCaseUnit];
  // 未知の単位に対するフォールバック
  console.warn(`Unknown unit "${unit}". Defaulting to 'serving'(304).`);
  return 304;
};

/**
 * Fitbitの認証フローの一部として、認可コードをアクセストークンと交換します。
 * この関数は、ユーザーがFitbitでの認証を成功させた後、コールバックURL（`webhookHandler`）から呼び出されます。
 * 取得したトークンは、FitbitユーザーIDをキーとしてFirestoreに保存され、FirebaseユーザーIDと関連付けられます。
 *
 * @param clientId FitbitアプリケーションのクライアントID。
 * @param clientSecret Fitbitアプリケーションのクライアントシークレット。
 * @param code ユーザーの認証後にFitbitから提供される認可コード。
 * @param firebaseUid トークンを関連付けるFirebaseユーザーのUID。
 * @returns Fitbit APIからのトークン情報を含むPromise。
 */
export async function exchangeCodeForTokens(
  clientId: string,
  clientSecret: string,
  code: string,
  firebaseUid: string,
): Promise<any> {
  const response = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.OAUTH_FITBIT_REDIRECT_URI || "",
      client_id: clientId,
    }).toString(),
  });
  const data: any = await response.json();
  if (!response.ok) {
    console.error("Fitbit token exchange error:", data);
    throw new FitbitApiError("Failed to exchange code for tokens.");
  }
  console.log("Code exchanged for tokens successfully.");
  // Save tokens to Firestore using the response's user_id and the passed firebaseUid
  await saveTokensToFirestore(firebaseUid, data.user_id, data);
  return data;
}

/**
 * 期限切れのFitbitアクセストークンをリフレッシュトークンを使って更新します。
 * APIリクエストの前に `expiresAt` をチェックし、トークンが古い場合にこの関数を呼び出すことが重要です。
 * 更新されたトークンは、新しい有効期限と共にFirestoreに上書き保存されます。
 *
 * @param firebaseUid どのユーザーのトークンをリフレッシュするかを指定するためのFirebase UID。
 * @param clientId FitbitアプリケーションのクライアントID。
 * @param clientSecret Fitbitアプリケーションのクライアントシークレット。
 * @returns 新しいアクセストークン文字列を含むPromise。
 */
export async function refreshFitbitAccessToken(
  firebaseUid: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const currentTokens = await getTokensFromFirestore(firebaseUid);
  if (!currentTokens || !currentTokens.refreshToken) {
    throw new AuthenticationError(
      `No refresh token found for user ${firebaseUid}. Please re-authenticate.`,
    );
  }

  const response = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentTokens.refreshToken,
    }).toString(),
  });

  const newTokens: any = await response.json();
  if (!response.ok) {
    console.error("Fitbit refresh token error:", newTokens);
    throw new FitbitApiError(
      `Fitbit API Refresh Error: ${newTokens.errors ? newTokens.errors[0].message : "Unknown"}`,
    );
  }

  console.log(`Token refreshed for user ${firebaseUid}.`);
  // Pass the existing fitbitUserId when saving to Firestore
  await saveTokensToFirestore(
    firebaseUid,
    currentTokens.fitbitUserId,
    newTokens,
  );
  return newTokens.access_token;
}

/**
 * 食品をFitbitに作成するヘルパー関数
 */
async function createFoods(
  accessToken: string,
  foods: FoodItem[],
  fitbitUserId: string,
): Promise<(FoodItem & { foodId: number; unitId: number })[]> {
  const createdFoods: (FoodItem & { foodId: number; unitId: number })[] = [];

  for (const food of foods) {
    if (!food.foodName || !food.amount || !food.unit) {
      throw new ValidationError(
        `Missing required field for food log: ${food.foodName || "Unknown Food"}.`,
      );
    }

    const unitId = getUnitId(food.unit);

    const createFoodParams = new URLSearchParams();
    createFoodParams.append("name", food.foodName);
    createFoodParams.append("defaultFoodMeasurementUnitId", unitId.toString());
    createFoodParams.append("defaultServingSize", food.amount.toString());
    createFoodParams.append(
      "calories",
      Math.round(food.calories || 0).toString(),
    );

    createFoodParams.append("formType", food.formType || "DRY");
    createFoodParams.append(
      "description",
      food.description || `Logged via Gemini: ${food.foodName}`,
    );

    for (const [foodKey, apiParam] of Object.entries(NUTRITION_MAP)) {
      const value = food[foodKey as keyof FoodItem];
      if (value !== undefined && value !== null) {
        createFoodParams.append(apiParam, value.toString());
      }
    }

    const createFoodResponse = await fetch(
      `https://api.fitbit.com/1/user/${fitbitUserId}/foods.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: createFoodParams.toString(),
      },
    );

    const createFoodResult =
      (await createFoodResponse.json()) as CreateFoodResponse;

    if (!createFoodResponse.ok) {
      console.error("Fitbit create food error response:", createFoodResult);
      const errorMessage =
        (createFoodResult as any).errors && (createFoodResult as any).errors[0]
          ? (createFoodResult as any).errors[0].message
          : "Unknown error";
      throw new FitbitApiError(
        `Failed to create food "${food.foodName}": ${errorMessage}`,
      );
    }
    const foodId = createFoodResult.food.foodId;
    console.log(
      `Successfully created food: ${food.foodName} (Food ID: ${foodId})`,
    );
    createdFoods.push({ ...food, foodId, unitId });
  }

  return createdFoods;
}

/**
 * 作成された食品をログに記録するヘルパー関数
 */
async function logFoods(
  accessToken: string,
  createdFoods: (FoodItem & { foodId: number; unitId: number })[],
  nutritionData: CreateFoodLogRequest,
  fitbitUserId: string,
  mealTypeId: MealTypeId,
): Promise<LogFoodResponse[]> {
  const logResults: LogFoodResponse[] = [];

  for (const createdFood of createdFoods) {
    const logFoodParams = new URLSearchParams({
      foodId: createdFood.foodId.toString(),
      mealTypeId: mealTypeId.toString(),
      unitId: createdFood.unitId.toString(),
      amount: createdFood.amount.toString(),
      date: nutritionData.log_date,
      time: nutritionData.log_time,
    }).toString();

    const logFoodResponse = await fetch(
      `https://api.fitbit.com/1/user/${fitbitUserId}/foods/log.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: logFoodParams,
      },
    );

    if (!logFoodResponse.ok) {
      const errorData: any = await logFoodResponse.json();
      console.error("Fitbit log food error response:", errorData);
      const errorMessage =
        errorData.errors && errorData.errors[0]
          ? errorData.errors[0].message
          : "Unknown error";
      throw new FitbitApiError(
        `Failed to log food "${createdFood.foodName}": ${errorMessage}`,
      );
    }

    const logResult = (await logFoodResponse.json()) as LogFoodResponse;
    console.log(
      `Successfully logged food: ${createdFood.foodName} for user ${fitbitUserId}`,
    );
    logResults.push(logResult);
  }

  return logResults;
}

/**
 * 複数の食品情報をFitbitに記録するメインロジック。
 * Fitbit APIの仕様上、食品を「作成」してから「記録」するという2段階のプロセスが必要です。
 * 1. **食品の作成**: 提供された栄養情報（カロリー、タンパク質など）を元に、ユーザーのプライベート食品データベースに新しい食品を作成します。
 *    - この段階で、各食品にユニークな `foodId` がFitbitによって割り当てられます。
 *    - APIはバッチ処理をサポートしていないため、各食品を直列で1つずつ作成します。
 * 2. **食事ログの記録**: 作成した食品の `foodId` を使用し、指定された日時、食事の種類（朝食など）で食事ログを記録します。
 *    - こちらも同様に、各食品を1つずつ記録します。
 *
 * @param accessToken 有効なFitbit APIアクセストークン。
 * @param nutritionData 記録する食品の配列と、食事の種類、日時を含むリクエストオブジェクト。
 * @param fitbitUserId 操作対象のFitbitユーザーID。
 * @returns Fitbit APIからのレスポンスオブジェクトの配列を含むPromise。
 */
export async function processAndLogFoods(
  accessToken: string,
  nutritionData: CreateFoodLogRequest,
  fitbitUserId: string,
): Promise<any[]> {
  const mealTypeId: MealTypeId =
    (MEAL_TYPE_MAP as any)[nutritionData.meal_type] || MEAL_TYPE_MAP.Anytime;

  if (
    !nutritionData.foods ||
    !Array.isArray(nutritionData.foods) ||
    nutritionData.foods.length === 0
  ) {
    throw new ValidationError(
      'Invalid input: "foods" array is missing or empty.',
    );
  }

  // フェーズ1: 全ての食品をFitbitに「作成」する (直列実行)
  const createdFoods = await createFoods(
    accessToken,
    nutritionData.foods,
    fitbitUserId,
  );

  // フェーズ2: 作成した全ての食品を「ログ記録」する (直列実行)
  return logFoods(
    accessToken,
    createdFoods,
    nutritionData,
    fitbitUserId,
    mealTypeId,
  );
}
