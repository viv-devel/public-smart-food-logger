variable "netlify_site_id" {
  type = string
}

variable "netlify_team_id" {
  type = string
}

variable "netlify_env_vars" {
  type = map(list(object({
    value   = string
    context = string
  })))
}
