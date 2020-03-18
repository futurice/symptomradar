# This is used to allow access to our S3 bucket from CloudFront, and nowhere else
resource "random_string" "s3_read_password" {
  length  = 32
  special = false
}

# Create the S3 bucket in which the static content for the site should be hosted
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.name_prefix}frontend"

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
  bucket = aws_s3_bucket.frontend.id

  # https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-2
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.frontend.id}/*",
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

  origin_url                 = "http://${aws_s3_bucket.frontend.website_endpoint}/" # S3 website endpoints are only available over plain HTTP
  origin_custom_header_name  = "User-Agent"                                         # our S3 bucket will only allow requests containing this custom header
  origin_custom_header_value = "${random_string.s3_read_password.result}"           # somewhat perplexingly, this is the "correct" way to ensure users can't bypass CloudFront on their way to S3 resources; https://abridge2devnull.com/posts/2018/01/restricting-access-to-a-cloudfront-s3-website-origin/
  name_prefix                = var.name_prefix
  site_domain                = "dev.vigilant-sniffle.com"
  viewer_https_only          = true
  basic_auth_username        = "paavo"
  basic_auth_password        = "vayrynen"
}
