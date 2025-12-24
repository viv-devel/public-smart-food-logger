# Generated GitHub Environment Config for CI

locals {
  secrets = {
    FITBIT_CLIENT_ID        = var.FITBIT_CLIENT_ID
    FITBIT_CLIENT_SECRET    = var.FITBIT_CLIENT_SECRET
    RECAPTCHA_V3_SECRET_KEY = var.RECAPTCHA_V3_SECRET_KEY
  }
  variables = {
    APP_ENVIRONMENT                          = var.APP_ENVIRONMENT
    FITBIT_REDIRECT_URI                      = var.FITBIT_REDIRECT_URI
    FOOD_LOG_URL                             = var.FOOD_LOG_URL
    NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI  = var.NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI
    NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI = var.NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI
    NEXT_PUBLIC_MOCK_AUTH                    = var.NEXT_PUBLIC_MOCK_AUTH
    NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI    = var.NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI
    NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY        = var.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
    NEXT_PUBLIC_RECAPTCHA_BACKEND_URL        = var.NEXT_PUBLIC_RECAPTCHA_BACKEND_URL
    OAUTH_FITBIT_REDIRECT_URI                = var.OAUTH_FITBIT_REDIRECT_URI
  }
}

resource "github_actions_environment_secret" "secrets" {
  for_each = local.secrets

  repository      = "public-smart-food-logger"
  environment     = "ci"
  secret_name     = each.key
  plaintext_value = each.value
}

resource "github_actions_environment_variable" "vars" {
  for_each = local.variables

  repository    = "public-smart-food-logger"
  environment   = "ci"
  variable_name = each.key
  value         = each.value
}
