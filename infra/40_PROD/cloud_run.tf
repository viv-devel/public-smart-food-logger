locals {
  # Flatten services and domains for domain mapping
  domain_mappings = flatten([
    for service_key, service in var.cloud_run_config.services : [
      for domain in service.domains : {
        service_key  = service_key
        service_name = service.service_name
        domain       = domain
      }
    ]
  ])
}

# Cloud Run Service Definition (Managed by Terraform "loosely")
resource "google_cloud_run_service" "services" {
  for_each = var.cloud_run_config.services

  name     = each.value.service_name
  location = var.cloud_run_config.region
  project  = var.cloud_run_config.project_id

  template {
    spec {
      containers {
        image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder, will be ignored
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template,
      traffic,
      metadata[0].annotations["client.knative.dev/user-image"],
      metadata[0].annotations["run.googleapis.com/client-name"],
      metadata[0].annotations["run.googleapis.com/client-version"],
      metadata[0].labels["commit-sha"],
      metadata[0].labels["managed-by"],
      metadata[0].labels["gcb-build-id"],
      metadata[0].labels["gcb-trigger-id"],
    ]
  }
}

# Domain Mapping
resource "google_cloud_run_domain_mapping" "domain_mappings" {
  for_each = {
    for mapping in local.domain_mappings : "${mapping.service_key}-${mapping.domain}" => mapping
  }

  location = var.cloud_run_config.region
  project  = var.cloud_run_config.project_id
  name     = each.value.domain

  metadata {
    namespace = var.cloud_run_config.project_id
  }

  spec {
    route_name = google_cloud_run_service.services[each.value.service_key].name
  }
}
