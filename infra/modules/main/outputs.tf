output "debug" {
  value = {
    s3_storage     = aws_s3_bucket.storage.id
    frontend       = module.frontend
    backend_api    = module.backend_api
    backend_worker = module.backend_worker
  }
}
