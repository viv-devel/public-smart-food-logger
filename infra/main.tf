terraform {
  required_version = "~> 1.6"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

module "common" {
  source          = "./00_common"
  netlify_site_id = var.netlify_site_id
  netlify_team_id = var.netlify_team_id
  cloudflare_zone_id = var.cloudflare_zone_id
  cloudflare_dns_records = var.cloudflare_dns_records

  # Netlify Environment Variables
  APP_ENVIRONMENT                            = var.netlify_env_vars["APP_ENVIRONMENT"]
  BACKEND_FITBIT_WEBHOOK_URL                 = var.netlify_env_vars["BACKEND_FITBIT_WEBHOOK_URL"]
  NEXT_PUBLIC_FIREBASE_API_KEY               = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_API_KEY"]
  NEXT_PUBLIC_FIREBASE_APP_ID                = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_APP_ID"]
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN           = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"]
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID        = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"]
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID   = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"]
  NEXT_PUBLIC_FIREBASE_PROJECT_ID            = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET        = var.netlify_env_vars["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"]
  NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI    = var.netlify_env_vars["NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI"]
  NEXT_PUBLIC_FITBIT_CLIENT_ID               = var.netlify_env_vars["NEXT_PUBLIC_FITBIT_CLIENT_ID"]
  NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI   = var.netlify_env_vars["NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI"]
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY             = var.netlify_env_vars["NEXT_PUBLIC_RECAPTCHA_SITE_KEY"]
}

module "ci" {
  source = "./10_ci"

  APP_ENVIRONMENT                          = var.github_env_vars["ci"]["variables"]["APP_ENVIRONMENT"]
  FITBIT_BACKEND_REDIRECT_URI              = var.github_env_vars["ci"]["variables"]["FITBIT_BACKEND_REDIRECT_URI"]
  FITBIT_REDIRECT_URI                      = var.github_env_vars["ci"]["variables"]["FITBIT_REDIRECT_URI"]
  NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI  = var.github_env_vars["ci"]["variables"]["NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI"]
  NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI = var.github_env_vars["ci"]["variables"]["NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI"]
  NEXT_PUBLIC_MOCK_AUTH                    = var.github_env_vars["ci"]["variables"]["NEXT_PUBLIC_MOCK_AUTH"]

  FITBIT_CLIENT_ID               = var.github_env_vars["ci"]["secrets"]["FITBIT_CLIENT_ID"]
  FITBIT_CLIENT_SECRET           = var.github_env_vars["ci"]["secrets"]["FITBIT_CLIENT_SECRET"]
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY = var.github_env_vars["ci"]["secrets"]["NEXT_PUBLIC_RECAPTCHA_SITE_KEY"]
}

# module "preview" {
#   source          = "./20_preview"
#   input_variables = var.github_env_vars["preview"]["variables"]
#   input_secrets   = var.github_env_vars["preview"]["secrets"]
# }

module "stg" {
  source = "./30_stg"

  FITBIT_REDIRECT_URI = var.github_env_vars["staging"]["variables"]["FITBIT_REDIRECT_URI"]

  DISCORD_WEBHOOK_ID    = var.github_env_vars["staging"]["secrets"]["DISCORD_WEBHOOK_ID"]
  DISCORD_WEBHOOK_TOKEN = var.github_env_vars["staging"]["secrets"]["DISCORD_WEBHOOK_TOKEN"]
  FITBIT_CLIENT_ID      = var.github_env_vars["staging"]["secrets"]["FITBIT_CLIENT_ID"]
  FITBIT_CLIENT_SECRET  = var.github_env_vars["staging"]["secrets"]["FITBIT_CLIENT_SECRET"]
  FUNCTION_REGION       = var.github_env_vars["staging"]["secrets"]["FUNCTION_REGION"]
  GCP_SA_KEY            = var.github_env_vars["staging"]["secrets"]["GCP_SA_KEY"]
  PROJECT_ID            = var.github_env_vars["staging"]["secrets"]["PROJECT_ID"]
}

module "prod" {
  source = "./40_PROD"

  FITBIT_REDIRECT_URI = var.github_env_vars["production"]["variables"]["FITBIT_REDIRECT_URI"]

  DISCORD_WEBHOOK_ID    = var.github_env_vars["production"]["secrets"]["DISCORD_WEBHOOK_ID"]
  DISCORD_WEBHOOK_TOKEN = var.github_env_vars["production"]["secrets"]["DISCORD_WEBHOOK_TOKEN"]
  FITBIT_CLIENT_ID      = var.github_env_vars["production"]["secrets"]["FITBIT_CLIENT_ID"]
  FITBIT_CLIENT_SECRET  = var.github_env_vars["production"]["secrets"]["FITBIT_CLIENT_SECRET"]
  FUNCTION_REGION       = var.github_env_vars["production"]["secrets"]["FUNCTION_REGION"]
  GCP_SA_KEY            = var.github_env_vars["production"]["secrets"]["GCP_SA_KEY"]
  PROJECT_ID            = var.github_env_vars["production"]["secrets"]["PROJECT_ID"]
}

