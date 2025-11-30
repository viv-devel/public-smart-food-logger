// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Intercept Firebase anonymous sign-in requests and return a mock successful response.
// This prevents tests from failing due to invalid API key errors in a test environment.
beforeEach(() => {
  if (Cypress.env("CYPRESS_MOCK_AUTH") === "true") {
    // Intercept Firebase anonymous sign-in requests
    cy.intercept(
      {
        method: "POST",
        hostname: "identitytoolkit.googleapis.com",
        pathname: "/v1/accounts:signUp",
      },
      {
        statusCode: 200,
        body: {
          idToken: "fake-id-token",
          refreshToken: "fake-refresh-token",
          expiresIn: "3600",
          localId: "fake-local-id",
        },
      },
    ).as("anonymousSignIn");

    // Intercept Firebase user lookup requests
    cy.intercept(
      {
        method: "POST",
        hostname: "identitytoolkit.googleapis.com",
        pathname: "/v1/accounts:lookup",
      },
      {
        statusCode: 200,
        body: {
          kind: "identitytoolkit#GetAccountInfoResponse",
          users: [
            {
              localId: "fake-local-id-from-lookup",
              lastLoginAt: "1762651816525",
              createdAt: "1762651816525",
              lastRefreshAt: "2025-11-09T01:30:16.525Z",
            },
          ],
        },
      },
    ).as("lookupUser");
  }
});
