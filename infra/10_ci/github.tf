# Generated GitHub Environment Config for CI

resource "github_actions_environment_secret" "secrets" {
  for_each = var.input_secrets

  repository      = "public-smart-food-logger"
  environment     = "ci"
  secret_name     = each.key
  plaintext_value = each.value
}

resource "github_actions_environment_variable" "vars" {
  for_each = var.input_variables

  repository    = "public-smart-food-logger"
  environment   = "ci"
  variable_name = each.key
  value         = each.value
}
