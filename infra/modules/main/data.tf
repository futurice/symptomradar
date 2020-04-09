# Make some basic info about the AWS account available
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# This is used to allow access to our S3 bucket from CloudFront, and nowhere else
resource "random_string" "s3_read_password" {
  length  = 32
  special = false
}
