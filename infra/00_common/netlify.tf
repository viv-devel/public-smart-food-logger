# Generated Netlify Environment Variables based on TSV and Synced with State

resource "netlify_environment_variable" "vars" {
  for_each = var.netlify_env_vars

  team_id = var.netlify_team_id
  site_id = var.netlify_site_id
  key     = each.key

  # Use dynamic block for values to handle list of objects
  # Note: The `values` block in the provider might expect a nested list? 
  # Checking original code: values = [ { value = "x", context = "y" } ]
  # So we directly pass the list.
  values = each.value
}
