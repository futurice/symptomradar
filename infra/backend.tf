# https://www.terraform.io/docs/providers/aws/index.html
provider "aws" {
  version = "~> 2.53"
  profile = "vigilant-sniffle"
  region  = "eu-central-1"
}

# https://www.terraform.io/docs/providers/aws/r/s3_bucket.html
resource "aws_s3_bucket" "terraform_state" {
  bucket = "vigilant-sniffle-terraform"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# https://www.terraform.io/docs/providers/aws/r/dynamodb_table.html
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "vigilant-sniffle-terraform"
  hash_key       = "LockID"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "LockID"
    type = "S"
  }
}

# https://www.terraform.io/docs/backends/types/s3.html
terraform {
  backend "s3" {
    profile        = "vigilant-sniffle"
    bucket         = "vigilant-sniffle-terraform"
    key            = "terraform"
    region         = "eu-central-1"
    dynamodb_table = "vigilant-sniffle-terraform"
  }
}
