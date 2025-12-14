# Variables
variable "APP_ENVIRONMENT"                          { type = string }
variable "FITBIT_BACKEND_REDIRECT_URI"              { type = string }
variable "FITBIT_REDIRECT_URI"                      { type = string }
variable "NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI"  { type = string }
variable "NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI" { type = string }
variable "NEXT_PUBLIC_MOCK_AUTH"                    { type = string }

# Secrets
variable "FITBIT_CLIENT_ID"               { type = string }
variable "FITBIT_CLIENT_SECRET"           { type = string }
variable "NEXT_PUBLIC_RECAPTCHA_SITE_KEY" { type = string }
