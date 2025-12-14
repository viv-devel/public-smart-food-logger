variable "netlify_site_id" {
  description = "Netlify site ID"
  type        = string
}

variable "netlify_team_id" {
  description = "Netlify team ID"
  type        = string
}

variable "netlify_env_vars" {
  description = "Map of Netlify environment variables, where each key is a variable name and value is a list of objects with 'value' and 'context' properties (e.g., 'production', 'deploy-preview', 'branch-deploy')"
  type = map(list(object({
    value   = string
    context = string
  })))
}
