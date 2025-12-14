terraform {
  required_version = "~> 1.6"

  backend "local" {
    path = "state/terraform.tfstate"
  }

  required_providers {
    # Google Cloud Platform (GCP)
    # google = {
    #   source  = "hashicorp/google"
    #   version = "~> 7.0" # 最新バージョン 7.x 系を許容
    # }

    # GitHub (Variables, Secrets, ブランチ保護)
    github = {
      source  = "integrations/github"
      version = "~> 6.0" # 最新バージョン 6.x 系を許容
    }

    # Cloudflare (DNS レコード, Workers)
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0" # 最新バージョン 5.x 系は破壊的変更が多いため一旦4系にする
    }

    # Netlify (サイト設定, 環境変数)
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.4" # 最新バージョン 0.x 系を許容
    }
  }
}
