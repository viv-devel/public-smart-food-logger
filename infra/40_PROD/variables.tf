# Variables
variable "FITBIT_REDIRECT_URI" { type = string }

# Secrets
variable "DISCORD_WEBHOOK_ID"    { type = string }
variable "DISCORD_WEBHOOK_TOKEN" { type = string }
variable "FITBIT_CLIENT_ID"      { type = string }
variable "FITBIT_CLIENT_SECRET"  { type = string }
variable "FUNCTION_REGION"       { type = string }
variable "GCP_SA_KEY"            { type = string }
variable "PROJECT_ID"            { type = string }

variable "cloud_run_config" {
  description = "Cloud Run configuration for this environment"
  type = object({
    project_id = string
    region     = string
    services = map(object({
      service_name = string
      domains      = list(string)
    }))
  })
}
