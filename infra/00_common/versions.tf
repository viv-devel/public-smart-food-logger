terraform {
  required_providers {
    github = {
      source = "integrations/github"
    }
    netlify = {
      source = "netlify/netlify"
    }
    cloudflare = {
      source = "cloudflare/cloudflare"
    }
  }
}
