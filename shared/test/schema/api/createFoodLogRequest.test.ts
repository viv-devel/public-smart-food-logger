import { describe, expect, it } from "vitest";

import { MEAL_TYPE_MAP } from "../../../src/external/fitbit/nutrition/logFood.ts";
import { CreateFoodLogRequestSchema } from "../../../src/schema/api/createFoodLogRequest.ts";

describe("CreateFoodLogRequestSchema", () => {
  it("should validate a valid request", () => {
    const validData = {
      foods: [
        {
          foodName: "Banana",
          amount: 1,
          unit: "piece",
          calories: 105,
          totalFat_g: 0.4,
          totalCarbohydrate_g: 27,
          protein_g: 1.3,
        },
      ],
      log_date: "2023-01-01",
      log_time: "12:00:00",
      meal_type: "Lunch",
      userId: "user123",
    };

    const result = CreateFoodLogRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate a request without optional fields", () => {
    const validData = {
      foods: [
        {
          foodName: "Water",
          amount: 200,
          unit: "ml",
          calories: 0,
        },
      ],
      log_date: "2023-01-01",
      log_time: "08:00:00",
      meal_type: "Breakfast",
    };

    const result = CreateFoodLogRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail if required fields are missing in FoodItem", () => {
    const invalidData = {
      foods: [
        {
          // foodName missing
          amount: 1,
          unit: "piece",
          calories: 100,
        },
      ],
      log_date: "2023-01-01",
      log_time: "12:00:00",
      meal_type: "Lunch",
    };

    const result = CreateFoodLogRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("foods");
      expect(result.error.issues[0].path).toContain(0);
      expect(result.error.issues[0].path).toContain("foodName");
    }
  });

  it("should fail if log_date format is invalid", () => {
    const invalidData = {
      foods: [],
      log_date: "2023/01/01", // Invalid format
      log_time: "12:00:00",
      meal_type: "Lunch",
    };

    const result = CreateFoodLogRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("log_date");
    }
  });

  it("should fail if log_time format is invalid", () => {
    const invalidData = {
      foods: [],
      log_date: "2023-01-01",
      log_time: "12:00", // Invalid format (missing seconds)
      meal_type: "Lunch",
    };

    const result = CreateFoodLogRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("log_time");
    }
  });

  it("should fail if meal_type is invalid", () => {
    const invalidData = {
      foods: [],
      log_date: "2023-01-01",
      log_time: "12:00:00",
      meal_type: "InvalidMealType",
    };

    const result = CreateFoodLogRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("meal_type");
    }
  });

  it("should accept all valid meal types", () => {
    const mealTypes = Object.keys(MEAL_TYPE_MAP);
    mealTypes.forEach((mealType) => {
      const validData = {
        foods: [],
        log_date: "2023-01-01",
        log_time: "12:00:00",
        meal_type: mealType,
      };
      const result = CreateFoodLogRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it("should strip unknown properties", () => {
    const dataWithExtra = {
      foods: [],
      log_date: "2023-01-01",
      log_time: "12:00:00",
      meal_type: "Lunch",
      extraField: "should be stripped",
    };

    const result = CreateFoodLogRequestSchema.safeParse(dataWithExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).extraField).toBeUndefined();
    }
  });
});
