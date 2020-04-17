output "cloudfront_id" {
  description = "The ID of the CloudFront distribution that's used for hosting the content"
  value       = aws_cloudfront_distribution.this.id
}

output "web_endpoint" {
  description = "URL on which the site will be made available"
  value       = "https://${var.site_domain}/"
}

output "site_domain" {
  description = "Domain on which the site will be made available"
  value       = var.site_domain
}
