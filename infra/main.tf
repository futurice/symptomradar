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
  apex_redirect_domain   = "test-redirect.oiretutka.fi"
  backend_domain         = "api.dev.oiretutka.fi"
  open_data_domain       = "data.dev.oiretutka.fi"
  known_hashing_pepper   = "D4GxgVVh0XQCrVb7FiyCal5ZgnRVkiVf"
  ssm_secrets_prefix     = "/symptomradar/dev/"
  s3_logs_bucket         = aws_s3_bucket.s3_logs.id
  backend_cors_allow_any = true
  frontend_password      = var.frontend_password
}

# Implements an instance of the app, for a specific env
module "env_prod" {
  # IMPORTANT: The prod environment is pinned to the latest release version, so it won't change during normal development.
  # See infra/README.md for how to deal with it during releases, when actual prod infra changes need to be made.
  source    = "git::ssh://git@github.com/futurice/symptomradar.git//infra/modules/main?ref=v2.5"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix     = "${var.name_prefix}-prod"
  tags            = merge(var.tags, { Environment = "prod" })
  frontend_domain = "www.oiretutka.fi"
  # TODO: apex_redirect_domain = "oiretutka.fi"
  backend_domain       = "api.oiretutka.fi"
  open_data_domain     = "data.oiretutka.fi"
  known_hashing_pepper = "vu2xkUW9iGUsIOUqjDEfarmSLmoRJnxB"
  ssm_secrets_prefix   = "/symptomradar/prod/"
  s3_logs_bucket       = aws_s3_bucket.s3_logs.id
}
