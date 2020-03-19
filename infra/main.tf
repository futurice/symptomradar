# This is the DNS Zone to which we assume we can create DNS records
resource "aws_route53_zone" "vigilant_sniffle_com" {
  name = "vigilant-sniffle.com"
}

# Implements an instance of the app, for a specific env
module "env_dev" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix       = "vigilant-sniffle-dev-"
  frontend_password = var.frontend_password
}

# Pass along any output from the instantiated module
output "dev" {
  value = module.env_dev
}
