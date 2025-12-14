variable "input_variables" {
  description = "Map of GitHub environment variables"
  type        = map(string)
}

variable "input_secrets" {
  description = "Map of GitHub environment secrets"
  type        = map(string)
}
