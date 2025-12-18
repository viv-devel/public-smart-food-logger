locals {
  secrets = {
    DISCORD_WEBHOOK_ID      = var.DISCORD_WEBHOOK_ID
    DISCORD_WEBHOOK_TOKEN   = var.DISCORD_WEBHOOK_TOKEN
    FITBIT_CLIENT_ID        = var.FITBIT_CLIENT_ID
    FITBIT_CLIENT_SECRET    = var.FITBIT_CLIENT_SECRET
    FUNCTION_REGION         = var.FUNCTION_REGION
    GCP_SA_KEY              = var.GCP_SA_KEY
    PROJECT_ID              = var.PROJECT_ID
    RECAPTCHA_V3_SECRET_KEY = var.RECAPTCHA_V3_SECRET_KEY
  }
  variables = {
    FITBIT_REDIRECT_URI       = var.FITBIT_REDIRECT_URI
    OAUTH_FITBIT_REDIRECT_URI = var.OAUTH_FITBIT_REDIRECT_URI
  }
}

resource "github_actions_environment_secret" "secrets" {
  for_each = local.secrets

  repository      = "public-smart-food-logger"
  environment     = "production"
  secret_name     = each.key
  plaintext_value = each.value
}

resource "github_actions_environment_variable" "vars" {
  for_each = local.variables

  repository    = "public-smart-food-logger"
  environment   = "production"
  variable_name = each.key
  value         = each.value
}
