import { describe, expect, it } from "vitest";

import { ErrorDetailSchema } from "../../../src/schema/api/common.js";

describe("ErrorDetailSchema", () => {
  it("should validate an empty object (all fields optional)", () => {
    const result = ErrorDetailSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should validate a simple error message", () => {
    const data = {
      error: "Something went wrong",
    };
    const result = ErrorDetailSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.error).toBe("Something went wrong");
    }
  });

  it("should validate detailed errors", () => {
    const data = {
      details: {
        errors: [
          { message: "Field A is required" },
          { message: "Field B is invalid" },
        ],
        error: "Validation Failed",
      },
    };
    const result = ErrorDetailSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.details?.errors).toHaveLength(2);
      expect(result.data.details?.errors?.[0].message).toBe(
        "Field A is required",
      );
    }
  });

  it("should strip unknown properties", () => {
    const data = {
      error: "Error",
      unknownField: 123,
    };
    const result = ErrorDetailSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).unknownField).toBeUndefined();
    }
  });

  it("should fail if types are incorrect", () => {
    const data = {
      error: 123, // Should be string
    };
    const result = ErrorDetailSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
