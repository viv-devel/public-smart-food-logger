import { describe, expect, test } from "vitest";

import { getHeaderColor } from "./environment";

describe("getHeaderColor", () => {
  test("returns correct color for PROD", () => {
    expect(getHeaderColor("PROD")).toBe("bg-gray-800");
  });

  test("returns correct color for staging", () => {
    expect(getHeaderColor("staging")).toBe("bg-yellow-700");
  });

  test("returns correct color for local", () => {
    expect(getHeaderColor("local")).toBe("bg-blue-700");
  });

  test("returns correct color for ci-test", () => {
    expect(getHeaderColor("ci-test")).toBe("bg-green-700");
  });

  test("returns default color for unknown env", () => {
    expect(getHeaderColor("unknown")).toBe("bg-red-700");
  });

  test("returns default color for undefined env", () => {
    expect(getHeaderColor(undefined)).toBe("bg-red-700");
  });
});
