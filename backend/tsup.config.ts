import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  target: "node20",
  splitting: false,
  noExternal: ["@smart-food-logger/shared"],
});
