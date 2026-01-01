resource "google_project_iam_member" "artifact_registry_admin" {
  project = var.PROJECT_ID
  role    = "roles/artifactregistry.repoAdmin"
  member  = "serviceAccount:${jsondecode(var.GCP_SA_KEY).client_email}"
}
