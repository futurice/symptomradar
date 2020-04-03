# This is the DNS Zone to which we assume we can create DNS records
resource "aws_route53_zone" "oiretutka_fi" {
  name = "oiretutka.fi"
  tags = var.tags
}

# Implements an instance of the app, for a specific env
module "env_dev" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix            = "${var.name_prefix}-dev"
  tags                   = merge(var.tags, { Environment = "dev" })
  frontend_domain        = "dev.oiretutka.fi"
  backend_domain         = "api.dev.oiretutka.fi"
  ssm_secrets_prefix     = "/symptomradar/dev/"
  s3_logs_bucket         = aws_s3_bucket.s3_logs.id
  backend_cors_allow_any = true
  frontend_password      = var.frontend_password
}

# Implements an instance of the app, for a specific env
module "env_prod" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix        = "${var.name_prefix}-prod"
  tags               = merge(var.tags, { Environment = "prod" })
  frontend_domain    = "www.oiretutka.fi"
  backend_domain     = "api.oiretutka.fi"
  ssm_secrets_prefix = "/symptomradar/prod/"
  s3_logs_bucket     = aws_s3_bucket.s3_logs.id
}

# Pass along any output from the instantiated module
output "env_dev" {
  value = module.env_dev
}
