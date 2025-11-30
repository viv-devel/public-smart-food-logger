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

// OAuth flow redirect URI
const REDIRECT_URI = process.env.FITBIT_REDIRECT_URI;

/**
 * Exchanges an authorization code for an access token and refresh token.
 * @param {string} clientId Fitbit client ID.
 * @param {string} clientSecret Fitbit client secret.
 * @param {string} code The authorization code.
 * @param {string} firebaseUid The Firebase user ID to associate the tokens with.
 * @returns {Promise<object>} The token data from Fitbit.
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
      redirect_uri: REDIRECT_URI || "",
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
 * Refreshes a Fitbit access token for a specific user.
 * @param {string} firebaseUid The Firebase UID of the user.
 * @param {string} clientId Fitbit client ID.
 * @param {string} clientSecret Fitbit client secret.
 * @returns {Promise<string>} The new access token.
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
 * Creates and logs food data to Fitbit for a specific user.
 */
export async function processAndLogFoods(
  accessToken: string,
  nutritionData: CreateFoodLogRequest,
  fitbitUserId: string,
): Promise<any[]> {
  const mealTypeId: MealTypeId =
    (MEAL_TYPE_MAP as any)[nutritionData.meal_type] || MEAL_TYPE_MAP.Anytime;

  const getUnitId = (unit: string): number => {
    const unitMap: { [key: string]: number } = {
      g: 1,
      gram: 1,
      grams: 1,
      ml: 147,
      milliliter: 147,
      milliliters: 147,
      oz: 13,
      "fl oz": 19,
      serving: 86,
      個: 86,
    };
    const lowerCaseUnit = unit ? unit.toLowerCase() : "";
    if (unitMap[lowerCaseUnit]) return unitMap[lowerCaseUnit];
    console.warn(`Unknown unit "${unit}". Defaulting to 'serving'(86).`);
    return 86;
  };

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
  const createdFoods: (FoodItem & { foodId: number; unitId: number })[] = [];
  for (const food of nutritionData.foods) {
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

    const nutritionMap: { [key: string]: string } = {
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

    for (const [foodKey, apiParam] of Object.entries(nutritionMap)) {
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
      (await createFoodResponse.json()) as CreateFoodResponse; // 型アサーション

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

  // フェーズ2: 作成した全ての食品を「ログ記録」する (直列実行)
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
