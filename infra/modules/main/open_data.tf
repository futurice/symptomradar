# Create the S3 bucket in which the published open datasets are hosted
resource "aws_s3_bucket" "open_data" {
  bucket = "${var.name_prefix}-open-data"
  tags   = local.tags_open_data

  # Enable website hosting
  # Note, though, that when accessing the bucket over its SSL endpoint, the index_document will not be used
  website {
    index_document = "index.json"
  }

  logging {
    target_bucket = var.s3_logs_bucket
    target_prefix = "${var.name_prefix}-open-data/"
  }

  # Enable CORS on the bucket.
  # This alone is not enough; see below for additional CORS config on CloudFront.
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

# This is used to allow access to our S3 bucket from CloudFront, and nowhere else
resource "aws_s3_bucket_policy" "open_data" {
  bucket = aws_s3_bucket.open_data.id

  # https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-2
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.open_data.id}/*",
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
module "open_data_site" {
  source    = "../aws_reverse_proxy"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix                = "${var.name_prefix}-open-data"
  tags                       = local.tags_open_data
  origin_url                 = "http://${aws_s3_bucket.open_data.website_endpoint}/" # S3 website endpoints are only available over plain HTTP
  origin_custom_header_name  = "User-Agent"                                          # our S3 bucket will only allow requests containing this custom header
  origin_custom_header_value = random_string.s3_read_password.result                 # somewhat perplexingly, this is the "correct" way to ensure users can't bypass CloudFront on their way to S3 resources; https://abridge2devnull.com/posts/2018/01/restricting-access-to-a-cloudfront-s3-website-origin/
  site_domain                = var.open_data_domain
  viewer_https_only          = true
  basic_auth_username        = var.frontend_password == "" ? "" : "symptomradar"
  basic_auth_password        = var.frontend_password

  add_response_headers = {

    # Add basic security headers:
    Strict-Transport-Security = "max-age=31536000" # the page should ONLY be accessed using HTTPS, instead of using HTTP (max-age == one year)
    X-Content-Type-Options    = "nosniff"          # the MIME types advertised in the Content-Type headers should ALWAYS be followed; this allows to opt-out of MIME type sniffing

    # Remove some headers which could disclose details about our upstream server
    # Note that not all headers can be altered by Lambda@Edge: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html#lambda-header-restrictions
    Server                 = "" # "Server" header can't be removed, but this will reset it to "CloudFront"
    X-Amz-Error-Code       = ""
    X-Amz-Error-Message    = ""
    X-Amz-Error-Detail-Key = ""
    X-Amz-Request-Id       = ""
    X-Amz-Id-2             = ""

    # Because this is an open data site meant for public consumption, set a liberal CORS policy.
    # Note that this alone isn't enough: the upstream S3 bucket also needs to be CORS-aware, so it can serve OPTIONS requests correctly.
    Access-Control-Allow-Origin      = "*"
    Access-Control-Allow-Methods     = "GET"
    Access-Control-Allow-Headers     = "Authorization,DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
    Access-Control-Expose-Headers    = "Content-Length,Content-Range"
    Access-Control-Allow-Credentials = "true" # the site may be password-protected
  }
}

# Ensure each JSON file exists on S3
resource "aws_s3_bucket_object" "open_data_file" {
  for_each = local.open_data_files

  bucket        = aws_s3_bucket.open_data.id
  key           = "${each.value}.json"
  source        = "${path.module}/open_data/${each.value}.json"
  content_type  = "application/json"
  cache_control = "max-age=15"
  etag          = filemd5("${path.module}/open_data/${each.value}.json")
}

locals {
  open_data_files = toset([
    "low_population_postal_codes",
    "population_per_city",
    "postalcode_city_mappings",
    "topojson_finland_simplified",
    "topojson_finland_without_aland",
  ])
}
