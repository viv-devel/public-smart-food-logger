resource "github_actions_environment_variable" "vars" {
  for_each = var.input_variables

  repository    = "public-smart-food-logger"
  environment   = "staging"
  variable_name = each.key
  value         = each.value
}

resource "github_actions_environment_secret" "secrets" {
  for_each = var.input_secrets

  repository      = "public-smart-food-logger"
  environment     = "staging"
  secret_name     = each.key
  plaintext_value = each.value
}
