variable "name_prefix" {
  description = "Name prefix to use for objects that need to be created (only lowercase alphanumeric characters and hyphens allowed, for S3 bucket name compatibility)"
}

variable "frontend_password" {
  description = "When enabled, this password is required (along with user that's the env name, e.g. 'dev') to access the frontend"
  default     = ""
}
