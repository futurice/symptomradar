# https://www.terraform.io/docs/providers/aws/r/s3_bucket.html
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.name_prefix}-terraform-state"
  tags   = var.tags

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  logging {
    target_bucket = aws_s3_bucket.s3_logs.id
    target_prefix = "${var.name_prefix}-terraform-state/"
  }
}

# https://www.terraform.io/docs/providers/aws/r/dynamodb_table.html
resource "aws_dynamodb_table" "terraform_state_lock" {
  name         = "${var.name_prefix}-terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  tags         = var.tags

  attribute {
    name = "LockID"
    type = "S"
  }
}

# https://www.terraform.io/docs/backends/types/s3.html
# IMPORTANT: Terraform doesn't allow variable interpolations here, so var.name_prefix needs to be hard-coded here
terraform {
  backend "s3" {
    bucket         = "symptomradar-terraform-state"
    key            = "terraform"
    dynamodb_table = "symptomradar-terraform-state-lock"
  }
}
