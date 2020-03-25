# This is the DNS Zone to which we assume we can create DNS records
resource "aws_route53_zone" "oiretutka_fi" {
  name = "oiretutka.fi"
  tags = var.tags
}

# Implements an instance of the app, for a specific env
module "env_dev" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix     = "${var.name_prefix}-dev"
  tags            = merge(var.tags, { Environment = "dev" })
  frontend_domain = "dev.oiretutka.fi"
  backend_domain  = "api.dev.oiretutka.fi"
  s3_logs_bucket  = aws_s3_bucket.s3_logs.id
}

# Implements an instance of the app, for a specific env
module "env_prod" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix     = "${var.name_prefix}-prod"
  tags            = merge(var.tags, { Environment = "prod" })
  frontend_domain = "www.oiretutka.fi"
  backend_domain  = "api.oiretutka.fi"
  s3_logs_bucket  = aws_s3_bucket.s3_logs.id
}

resource "aws_s3_bucket" "s3_logs" {
  bucket = "s3logs-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.name}"
  acl    = "log-delivery-write"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    id      = "log"
    enabled = true
    expiration {
      days = 730
    }
  }
}

# Pass along any output from the instantiated module
output "env_dev" {
  value = module.env_dev
}
