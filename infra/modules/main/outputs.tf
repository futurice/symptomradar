output "s3_web_endpoint" {
  value = aws_s3_bucket.frontend.website_endpoint
}

output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "debug" {
  value = {
    frontend = module.frontend
    backend_api = module.backend_api
  }
}
