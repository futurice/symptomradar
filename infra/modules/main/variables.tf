variable "name_prefix" {
  description = "Name prefix to use for objects that need to be created (only lowercase alphanumeric characters and hyphens allowed, for S3 bucket name compatibility)"
}

variable "frontend_domain" {
  description = "Full domain name under which the frontend should be made available on the Internet"
}

variable "backend_domain" {
  description = "Full domain name under which the backend should be made available on the Internet"
}

variable "tags" {
  description = "AWS Tags to add to all resources created (where possible); see https://aws.amazon.com/answers/account-management/aws-tagging-strategies/"
  type        = map(string)
  default     = {}
}

variable "frontend_password" {
  description = "When enabled, this password is required (along with user that's the env name, e.g. 'dev') to access the frontend"
  default     = ""
}

variable "backend_cors_allow_any" {
  description = "When true, the backend API will send very permissive CORS headers (useful during development)"
  type        = bool
  default     = false
}

locals {
  tags_backend  = merge(var.tags, { Component = "backend" })
  tags_frontend = merge(var.tags, { Component = "frontend" })
  tags_storage  = merge(var.tags, { Component = "storage" })
}
