import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "test/cypress/support/e2e.ts",
    screenshotsFolder: "test/results/cypress/screenshots",
    videosFolder: "test/results/cypress/videos",
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
});
