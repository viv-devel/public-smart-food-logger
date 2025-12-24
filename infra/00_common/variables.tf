variable "netlify_site_id" {
  description = "Netlify site ID"
  type        = string
}

variable "netlify_team_id" {
  description = "Netlify team ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
}

variable "cloudflare_dns_records" {
  description = "Map of Cloudflare DNS records"
  type = map(object({
    name    = string
    content = string
    type    = string
    proxied = bool
    comment = optional(string)
  }))
  default = {}
}

variable "APP_ENVIRONMENT" {
  description = "Netlify Environment Variable: APP_ENVIRONMENT"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "BACKEND_FITBIT_WEBHOOK_URL" {
  description = "Netlify Environment Variable: BACKEND_FITBIT_WEBHOOK_URL"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_API_KEY" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_API_KEY"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_APP_ID" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_APP_ID"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_PROJECT_ID" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FITBIT_CLIENT_ID" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FITBIT_CLIENT_ID"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "FOOD_LOG_URL" {
  description = "Netlify Environment Variable: FOOD_LOG_URL"
  type = list(object({
    value   = string
    context = string
  }))
}


variable "NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY"
  type = list(object({
    value   = string
    context = string
  }))
}

variable "NEXT_PUBLIC_RECAPTCHA_BACKEND_URL" {
  description = "Netlify Environment Variable: NEXT_PUBLIC_RECAPTCHA_BACKEND_URL"
  type = list(object({
    value   = string
    context = string
  }))
}
