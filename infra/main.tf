terraform {
  required_version = "~> 1.6"
}

module "common" {
  source           = "./00_common"
  netlify_site_id  = var.netlify_site_id
  netlify_team_id  = var.netlify_team_id
  netlify_env_vars = var.netlify_env_vars
}

module "ci" {
  source          = "./10_ci"
  input_variables = var.github_env_vars["ci"]["variables"]
  input_secrets   = var.github_env_vars["ci"]["secrets"]
}

module "preview" {
  source          = "./20_preview"
  input_variables = var.github_env_vars["preview"]["variables"]
  input_secrets   = var.github_env_vars["preview"]["secrets"]
}

module "stg" {
  source          = "./30_stg"
  input_variables = var.github_env_vars["staging"]["variables"]
  input_secrets   = var.github_env_vars["staging"]["secrets"]
}

module "prod" {
  source          = "./40_PROD"
  input_variables = var.github_env_vars["production"]["variables"]
  input_secrets   = var.github_env_vars["production"]["secrets"]
}

