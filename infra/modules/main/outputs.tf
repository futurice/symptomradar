output "debug" {
  value = {
    s3_storage     = aws_s3_bucket.storage.id
    frontend       = module.frontend
    backend_api    = module.backend_api
    backend_worker = module.backend_worker
  }
}

output "storage_bucket_arn" {
  description = "This is the ARN of the s3 storage bucket"
  value       = aws_s3_bucket.storage.arn
}

output "storage_result_bucket_arn" {
  description = "This is the ARN of the s3 storage results bucket"
  value       = aws_s3_bucket.storage_results.arn
}
