# This is used to allow access to our S3 bucket from CloudFront, and nowhere else
resource "random_string" "s3_read_password" {
  length  = 32
  special = false
}

# Create the S3 bucket in which the static content for the site should be hosted
resource "aws_s3_bucket" "frontend_code" {
  bucket = "${var.name_prefix}-frontend-code"
  tags   = local.tags_frontend

  # Add a CORS configuration, so that we don't have issues with webfont loading
  # http://www.holovaty.com/writing/cors-ie-cloudfront/
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }

  # Enable website hosting
  # Note, though, that when accessing the bucket over its SSL endpoint, the index_document will not be used
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

# This is used to allow access to our S3 bucket from CloudFront, and nowhere else
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend_code.id

  # https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-2
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.frontend_code.id}/*",
      "Condition": {
        "StringEquals": {
          "aws:UserAgent": "${random_string.s3_read_password.result}"
        }
      }
    }
  ]
}
EOF
}

# Implements a CloudFront setup for serving static content from the S3 bucket
module "frontend" {
  source    = "../aws_reverse_proxy"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix                = "${var.name_prefix}-frontend"
  tags                       = local.tags_frontend
  origin_url                 = "http://${aws_s3_bucket.frontend_code.website_endpoint}/" # S3 website endpoints are only available over plain HTTP
  origin_custom_header_name  = "User-Agent"                                              # our S3 bucket will only allow requests containing this custom header
  origin_custom_header_value = random_string.s3_read_password.result                     # somewhat perplexingly, this is the "correct" way to ensure users can't bypass CloudFront on their way to S3 resources; https://abridge2devnull.com/posts/2018/01/restricting-access-to-a-cloudfront-s3-website-origin/
  site_domain                = var.frontend_domain
  viewer_https_only          = true
  basic_auth_username        = "symptomradar"
  basic_auth_password        = var.frontend_password

  add_response_headers = {

    # Add basic security headers:
    Strict-Transport-Security = "max-age=31536000"
    X-Content-Type-Options    = "nosniff"
    X-XSS-Protection          = "1; mode=block"
    Referrer-Policy           = "same-origin"

    # Add CSP header:
    # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    Content-Security-Policy = replace(replace(replace(<<-EOT
      default-src
        'none'
        ;
      block-all-mixed-content
        ;
      connect-src
        ${var.backend_domain}
        ;
      form-action
        'none'
        ;
      frame-ancestors
        https://*
        ;
      img-src
        'self'
        data:
        ;
      manifest-src
        'self'
        ;
      navigate-to
        'none'
        ;
      prefetch-src
        'none'
        ;
      script-src
        'self'
        ;
      script-src-attr
        'none'
        ;
      style-src
        'self'
        ;
      style-src-attr
        'none'
        ;
EOT
    , "/#.*/", " "), "/[ \n]+/", " "), " ;", ";")
  }
}
