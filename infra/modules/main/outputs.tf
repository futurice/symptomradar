output "frontend" {
  value = module.frontend
}

output "backend_api" {
  value = module.backend_api
}

output "backend_worker" {
  value = module.backend_worker
}

output "storage_bucket_arn" {
  value = aws_s3_bucket.storage.arn
}

output "storage_result_bucket_arn" {
  value = aws_s3_bucket.storage_results.arn
}
