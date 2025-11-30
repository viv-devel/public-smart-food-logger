// Set default environment variables for testing
process.env.GCP_PROJECT = process.env.GCP_PROJECT || "test-project";
process.env.FITBIT_REDIRECT_URI =
  process.env.FITBIT_REDIRECT_URI || "http://localhost:3000/oauth";
