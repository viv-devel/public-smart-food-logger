/**
 * @file Fitbitへの食事ログリクエストのテンプレートJSONを生成するユーティリティを提供します。
 * @module frontend/utils/fitbitTemplate
 */

/**
 * 食事ログリクエストのサンプルとして使用する、整形されたJSON文字列を生成します。
 *
 * この関数は、主に以下の目的で使用されます。
 * 1. Gemini APIがうまく機能しなかった、あるいはユーザーが手動でJSONを編集したい場合のテンプレートを提供する。
 * 2. 開発者がAPIリクエストのデータ構造を容易に確認できるようにする。
 *
 * 生成されるJSONには、照り焼きサーモンと白米という2つの食品アイテムがサンプルとして含まれており、
 * 必須フィールドや栄養素の記述方法を示しています。
 * `log_date` と `log_time` は、関数が呼び出された現在の⽇時に動的に設定されます。
 *
 * @returns {string} 整形された食事ログリクエストのJSON文字列。
 */
export const generateTemplate = () => {
  const now = new Date();
  const log_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const log_time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return JSON.stringify(
    {
      foods: [
        {
          foodName: "Example Salmon Teriyaki",
          amount: 1,
          unit: "serving",
          calories: 450,
          description: "A delicious salmon teriyaki fillet.",
          formType: "DRY",
          protein_g: 35,
          totalFat_g: 20,
          saturatedFat_g: 4,
          transFat_g: 0,
          cholesterol_mg: 110,
          sodium_mg: 600,
          potassium_mg: 400,
          totalCarbohydrate_g: 30,
          dietaryFiber_g: 2,
          sugars_g: 15,
          iron_mg: 1.5,
          vitaminD_iu: 600,
        },
        {
          foodName: "White Rice",
          amount: 150,
          unit: "g",
          calories: 205,
          description: "Steamed white rice.",
          formType: "DRY",
          totalCarbohydrate_g: 45,
          protein_g: 4,
        },
      ],
      log_date: log_date,
      log_time: log_time,
      meal_type: "Dinner",
    },
    null,
    2,
  );
};
