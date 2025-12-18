# Generated Netlify Environment Variables based on TSV and Synced with State

locals {
  netlify_env_vars = {
    APP_ENVIRONMENT                          = var.APP_ENVIRONMENT
    BACKEND_FITBIT_WEBHOOK_URL               = var.BACKEND_FITBIT_WEBHOOK_URL
    NEXT_PUBLIC_FIREBASE_API_KEY             = var.NEXT_PUBLIC_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_APP_ID              = var.NEXT_PUBLIC_FIREBASE_APP_ID
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         = var.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID      = var.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = var.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_PROJECT_ID          = var.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      = var.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI  = var.NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI
    NEXT_PUBLIC_FITBIT_CLIENT_ID             = var.NEXT_PUBLIC_FITBIT_CLIENT_ID
    NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI = var.NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI
    FOOD_LOG_URL                             = var.FOOD_LOG_URL
    NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI    = var.NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY           = var.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY        = var.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
    NEXT_PUBLIC_RECAPTCHA_BACKEND_URL        = var.NEXT_PUBLIC_RECAPTCHA_BACKEND_URL
  }
}

resource "netlify_environment_variable" "vars" {
  for_each = local.netlify_env_vars

  team_id = var.netlify_team_id
  site_id = var.netlify_site_id
  key     = each.key

  # Use dynamic block for values to handle list of objects
  # Note: The `values` block in the provider might expect a nested list? 
  # Checking original code: values = [ { value = "x", context = "y" } ]
  # So we directly pass the list.
  values = each.value
}
