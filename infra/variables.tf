variable "name_prefix" {
  description = "Name prefix to use for objects that need to be created (only lowercase alphanumeric characters and hyphens allowed, for S3 bucket name compatibility)"
  default     = "vigilant-sniffle"
}

variable "tags" {
  description = "AWS Tags to add to all resources created (where possible); see https://aws.amazon.com/answers/account-management/aws-tagging-strategies/"
  type        = map(string)

  default = {
    Application = "vigilant-sniffle"
    Environment = "infra"
  }
}

variable "frontend_password" {
  description = "When enabled, this password is required (along with user that's the env name, e.g. 'dev') to access the frontend"
}
