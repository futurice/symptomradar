output "cloudfront_id" {
  description = "The ID of the CloudFront distribution that's used for hosting the content"
  value       = aws_cloudfront_distribution.this.id
}

output "site_domain" {
  description = "Domain on which the site will be made available"
  value       = var.site_domain
}

output "resources" {
  description = "Names/ID's of resources created; can be used for e.g. monitoring, or attaching external resources"
  value = {
    cloudfront_distribution = aws_cloudfront_distribution.this.id
  }
}
