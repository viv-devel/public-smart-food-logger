import { describe, expect, it } from "vitest";

import {
  type CreateFoodRequest,
  CreateFoodRequestSchema,
  CreateFoodResponseSchema,
  type FormType,
  FormTypeSchema,
} from "../../../../src/external/fitbit/nutrition/createFood.js";

describe("CreateFoodRequestSchema", () => {
  describe("必須フィールドのバリデーション", () => {
    it("全ての必須フィールドが揃っている場合、バリデーションが成功する", () => {
      const validData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("nameが空文字列の場合、バリデーションが失敗する", () => {
      const invalidData = {
        name: "",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("caloriesが負の数の場合、バリデーションが失敗する", () => {
      const invalidData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: -10,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("defaultServingSizeが0以下の場合、バリデーションが失敗する", () => {
      const invalidData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 0,
        calories: 200,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("formTypeのバリデーション", () => {
    it("formTypeが'LIQUID'の場合、バリデーションが成功する", () => {
      const validData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("formTypeが'DRY'の場合、バリデーションが成功する", () => {
      const validData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "DRY" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("formTypeが不正な値の場合、バリデーションが失敗する", () => {
      const invalidData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "SOLID",
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("オプションの栄養素フィールド", () => {
    it("オプションフィールドが含まれている場合、バリデーションが成功する", () => {
      const validData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
        protein: 10,
        totalFat: 5,
        totalCarbohydrate: 30,
        vitaminC: 50,
        calcium: 0.5,
      };

      const result = CreateFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.protein).toBe(10);
        expect(result.data.totalFat).toBe(5);
      }
    });

    it("オプションフィールドが負の数の場合、バリデーションが失敗する", () => {
      const invalidData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "LIQUID" as const,
        description: "テスト用の食品です",
        protein: -5,
      };

      const result = CreateFoodRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("オプションフィールドが省略されている場合、バリデーションが成功する", () => {
      const validData = {
        name: "テスト食品",
        defaultFoodMeasurementUnitId: "123",
        defaultServingSize: 100,
        calories: 200,
        formType: "DRY" as const,
        description: "テスト用の食品です",
      };

      const result = CreateFoodRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe("FormTypeSchema", () => {
  it("'LIQUID'が有効な値として認識される", () => {
    const result = FormTypeSchema.safeParse("LIQUID");
    expect(result.success).toBe(true);
  });

  it("'DRY'が有効な値として認識される", () => {
    const result = FormTypeSchema.safeParse("DRY");
    expect(result.success).toBe(true);
  });

  it("不正な値が拒否される", () => {
    const result = FormTypeSchema.safeParse("INVALID");
    expect(result.success).toBe(false);
  });
});

describe("型推論", () => {
  it("CreateFoodRequest型が正しく推論される", () => {
    const data: CreateFoodRequest = {
      name: "テスト食品",
      defaultFoodMeasurementUnitId: "123",
      defaultServingSize: 100,
      calories: 200,
      formType: "LIQUID",
      description: "テスト用の食品です",
    };

    // 型エラーがなければOK
    expect(data.name).toBe("テスト食品");
  });

  it("FormType型が正しく推論される", () => {
    const formType: FormType = "LIQUID";
    expect(formType).toBe("LIQUID");
  });
});

describe("CreateFoodResponseSchema", () => {
  it("正常なレスポンスをパースできる", () => {
    const response = {
      food: {
        foodId: 12345,
        name: "Test Food",
        units: [1, 2, 3],
      },
    };

    const result = CreateFoodResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.food.foodId).toBe(12345);
    }
  });
});
