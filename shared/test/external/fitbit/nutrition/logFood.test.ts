import { describe, expect, it } from "vitest";

import {
  type LogFoodRequest,
  LogFoodRequestSchema,
  LogFoodResponseSchema,
  MealTypeIdSchema,
} from "../../../../src/external/fitbit/nutrition/logFood.js";

describe("LogFoodRequestSchema", () => {
  describe("foodIdを使用するパターン", () => {
    it("foodIdと必須フィールドがある場合、バリデーションが成功する", () => {
      const validData = {
        foodId: "12345",
        mealTypeId: 1, // Breakfast
        unitId: "304",
        amount: 1.5,
        date: "2023-01-01",
        favorite: true,
      };

      const result = LogFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.foodId).toBe("12345");
      }
    });

    it("foodIdのみでfoodNameがない場合も成功する", () => {
      const validData = {
        foodId: "12345",
        mealTypeId: 3, // Lunch
        unitId: "304",
        amount: 1.0,
        date: "2023-01-01",
      };

      const result = LogFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("foodNameを使用するパターン", () => {
    it("foodNameと必須フィールドがある場合、バリデーションが成功する", () => {
      const validData = {
        foodName: "Apple",
        mealTypeId: 2, // Morning Snack
        unitId: "304",
        amount: 1.0,
        date: "2023-01-01",
        calories: 95,
        brandName: "Generic",
      };

      const result = LogFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("栄養素情報を含めても成功する", () => {
      const validData = {
        foodName: "Custom Meal",
        mealTypeId: 5, // Dinner
        unitId: "304",
        amount: 1.0,
        date: "2023-01-01",
        calories: 500,
        protein: 20,
        totalFat: 15,
        vitaminC: 10,
      };

      const result = LogFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.protein).toBe(20);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("foodIdもfoodNameもない場合、バリデーションが失敗する", () => {
      const invalidData = {
        mealTypeId: 1,
        unitId: "304",
        amount: 1.0,
        date: "2023-01-01",
      };

      const result = LogFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("日付形式が不正な場合、バリデーションが失敗する", () => {
      const invalidData = {
        foodId: "12345",
        mealTypeId: 1,
        unitId: "304",
        amount: 1.0,
        date: "2023/01/01", // Invalid format
      };

      const result = LogFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("mealTypeIdが不正な値の場合、バリデーションが失敗する", () => {
      const invalidData = {
        foodId: "12345",
        mealTypeId: 99, // Invalid ID
        unitId: "304",
        amount: 1.0,
        date: "2023-01-01",
      };

      const result = LogFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("foodNameが空文字の場合、バリデーションが失敗する", () => {
      const invalidData = {
        foodName: "",
        mealTypeId: 1,
        unitId: "304",
        amount: 1.0,
        date: "2023-01-01",
      };

      const result = LogFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("foodNameは必須です");
      }
    });
  });
});

describe("MealTypeIdSchema", () => {
  it("有効な食事タイプIDを受け入れる", () => {
    expect(MealTypeIdSchema.safeParse(1).success).toBe(true); // Breakfast
    expect(MealTypeIdSchema.safeParse(7).success).toBe(true); // Anytime
  });

  it("無効な食事タイプIDを拒否する", () => {
    expect(MealTypeIdSchema.safeParse(0).success).toBe(false);
    expect(MealTypeIdSchema.safeParse(6).success).toBe(false);
    expect(MealTypeIdSchema.safeParse(8).success).toBe(false);
  });
});

describe("LogFoodResponseSchema", () => {
  it("正常なレスポンスをパースできる", () => {
    const response = {
      foodLog: {
        isFavorite: true,
        logId: 12345,
        logDate: "2023-01-01",
        loggedFood: {
          foodId: 999,
          name: "Apple",
          amount: 1.0,
          unit: {
            id: 304,
            name: "medium",
            plural: "medium",
          },
          mealTypeId: 1,
          calories: 95,
          brand: "Generic",
        },
        nutritionalValues: {
          calories: 95,
        },
      },
    };

    const result = LogFoodResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.foodLog.logId).toBe(12345);
    }
  });
});
