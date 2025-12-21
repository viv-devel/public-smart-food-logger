

resource "cloudflare_record" "dns_records" {
  for_each = var.cloudflare_dns_records

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  content = each.value.content
  type    = each.value.type
  proxied = each.value.proxied
  comment = each.value.comment
}
