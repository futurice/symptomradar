module "aws_reverse_proxy" {
  source    = "../aws_reverse_proxy"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  origin_url             = "http://example.com/" # note that this is just a dummy value to satisfy CloudFront, it won't ever be used with the override_* variables in place
  site_domain            = var.redirect_domain
  name_prefix            = var.name_prefix
  comment_prefix         = var.comment_prefix
  cloudfront_price_class = var.cloudfront_price_class
  viewer_https_only      = var.viewer_https_only
  lambda_logging_enabled = var.lambda_logging_enabled
  hsts_max_age           = var.hsts_max_age
  tags                   = var.tags

  add_response_headers = {
    "Location" = var.redirect_url
  }

  override_response_code   = var.redirect_permanently ? "301" : "302"
  override_response_status = var.redirect_permanently ? "Moved Permanently" : "Found"

  override_response_body = <<EOF
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting</title>
  </head>
  <body>
    <pre>Redirecting to: <a href="${var.redirect_url}">${var.redirect_url}</a></pre>
  </body>
EOF

}
