variable "netlify_site_id" {
  description = "Netlify Site ID"
  type        = string
}

variable "netlify_team_id" {
  description = "Netlify Team ID"
  type        = string
}

variable "netlify_env_vars" {
  description = "Map of Netlify environment variables (key -> list of values with context)"
  type = map(list(object({
    value   = string
    context = string
  })))
}

variable "github_env_vars" {
  description = "GitHub environment variables and secrets per environment"
  type = map(object({
    variables = map(string)
    secrets   = map(string)
  }))
}

