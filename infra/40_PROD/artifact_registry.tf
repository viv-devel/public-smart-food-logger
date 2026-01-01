resource "google_artifact_registry_repository" "gcf_artifacts" {
  location      = var.FUNCTION_REGION
  repository_id = "gcf-artifacts"
  description   = "Docker repository for Cloud Run and Cloud Functions"
  format        = "DOCKER"
  project       = var.PROJECT_ID

  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      tag_state  = "ANY"
      older_than = "21600s"
    }
  }

  cleanup_policies {
    id     = "keep-recent-3"
    action = "KEEP"
    most_recent_versions {
      keep_count = 3
    }
  }
}
