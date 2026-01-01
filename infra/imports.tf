locals {
  stg_domain_mappings = flatten([
    for service_key, service in var.cloud_run_config["stg"].services : [
      for domain in service.domains : {
        service_key  = service_key
        service_name = service.service_name
        domain       = domain
      }
    ]
  ])
}

# ------------------------------------------------------------------------------
# STG Imports
# ------------------------------------------------------------------------------
import {
  for_each = var.cloud_run_config["stg"].services
  to       = module.stg.google_cloud_run_service.services[each.key]
  id       = "locations/${var.cloud_run_config["stg"].region}/namespaces/${var.cloud_run_config["stg"].project_id}/services/${each.value.service_name}"
}

import {
  for_each = {
    for mapping in local.stg_domain_mappings : "${mapping.service_key}-${mapping.domain}" => mapping
  }
  to = module.stg.google_cloud_run_domain_mapping.domain_mappings[each.key]
  id = "locations/${var.cloud_run_config["stg"].region}/namespaces/${var.cloud_run_config["stg"].project_id}/domainmappings/${each.value.domain}"
}

# ------------------------------------------------------------------------------
# PROD Imports
# ------------------------------------------------------------------------------
import {
  for_each = var.cloud_run_config["prod"].services
  to       = module.prod.google_cloud_run_service.services[each.key]
  id       = "locations/${var.cloud_run_config["prod"].region}/namespaces/${var.cloud_run_config["prod"].project_id}/services/${each.value.service_name}"
}

# Import existing Artifact Registries (Staging & Production)

# Import existing Staging Artifact Registry
import {
  to = module.stg.google_artifact_registry_repository.gcf_artifacts
  id = "projects/${var.cloud_run_config["stg"].project_id}/locations/${var.cloud_run_config["stg"].region}/repositories/gcf-artifacts"
}



# Import existing Production Artifact Registry
import {
  to = module.prod.google_artifact_registry_repository.gcf_artifacts
  id = "projects/${var.cloud_run_config["prod"].project_id}/locations/${var.cloud_run_config["prod"].region}/repositories/gcf-artifacts"
}
