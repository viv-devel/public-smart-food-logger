# Variables
variable "APP_ENVIRONMENT" { type = string }
variable "FITBIT_REDIRECT_URI" { type = string }
variable "FOOD_LOG_URL" { type = string }
variable "NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI" { type = string }
variable "NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI" { type = string }
variable "NEXT_PUBLIC_MOCK_AUTH" { type = string }
variable "NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI" { type = string }
variable "OAUTH_FITBIT_REDIRECT_URI" { type = string }
variable "NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY" { type = string }
variable "NEXT_PUBLIC_RECAPTCHA_BACKEND_URL" { type = string }

# Secrets
variable "FITBIT_CLIENT_ID" { type = string }
variable "FITBIT_CLIENT_SECRET" { type = string }
variable "NEXT_PUBLIC_RECAPTCHA_SITE_KEY" { type = string }
variable "RECAPTCHA_V3_SECRET_KEY" { type = string }
