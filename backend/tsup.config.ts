import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/recaptcha.ts",
    "src/health.ts",
    "src/handlers/oauth.ts",
    "src/handlers/foodlog.ts",
  ],
  format: ["esm"],
  clean: true,
  target: "node20",
  splitting: false,
  external: [
    "firebase-admin",
    "node-fetch",
    "@google-cloud/functions-framework",
    "zod",
    "@smart-food-logger/shared",
  ],
});
