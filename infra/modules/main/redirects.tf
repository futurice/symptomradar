# Implements a CloudFront setup for serving static content from the S3 bucket
module "apex_redirect" {
  source    = "../aws_domain_redirect"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  redirect_domain = var.apex_redirect_domain
  redirect_url    = "https://${var.frontend_domain}/"
  name_prefix     = "${var.name_prefix}-redirect-apex"
  tags            = local.tags_frontend
}
