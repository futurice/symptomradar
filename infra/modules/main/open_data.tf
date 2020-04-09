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

    # Because this is an open data site meant for public consumption, set a liberal CORS policy:
    Access-Control-Allow-Origin   = "*"
    Access-Control-Allow-Methods  = "OPTIONS,GET"
    Access-Control-Allow-Headers  = "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
    Access-Control-Expose-Headers = "Content-Length,Content-Range"
  }
}

# Ensure an index file exists listing the other files
# (the generation of this will be automated soon)
resource "aws_s3_bucket_object" "open_data_index" {
  bucket        = aws_s3_bucket.open_data.id
  key           = "index.json"
  content       = local.open_data_index
  content_type  = "application/json"
  cache_control = "max-age=15"
  etag          = md5(local.open_data_index)
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
    "city_level_general_results",
    "low_population_postal_codes",
    "population_per_city",
    "topojson_finland_simplified",
    "topojson_finland_without_aland",
  ])
  open_data_index = <<-EOF
  {
    "meta": {
      "description": "This is the open data site for the www.oiretutka.fi project"
    },
    "data": {
      "city_level_general_results": {
        "description": "Population and response count per each city in Finland, where the response count was higher than 25.",
        "generated": "2020-04-08T09:00:00.000Z",
        "link": "https://${var.open_data_domain}/city_level_general_results.json"
      },
      "low_population_postal_codes": {
        "description": "Mapping of postal code areas with too low a population to their nearest neighbor with high enough population. This is used before storing answers, to ensure privacy is preserved for participants from postal code areas with low population.",
        "generated": "2020-04-08T09:00:00.000Z",
        "link": "https://${var.open_data_domain}/low_population_postal_codes.json"
      },
      "population_per_city": {
        "description": "Population per each city in Finland",
        "generated": "2020-04-08T09:00:00.000Z",
        "link": "https://${var.open_data_domain}/population_per_city.json"
      },
      "topojson_finland_simplified": {
        "description": "Topography used to render the outline of the map of Finland. Based on the open data at https://github.com/lucified/finland-municipalities-topojson, with some post-processing applied.",
        "generated": "2020-04-08T09:00:00.000Z",
        "link": "https://${var.open_data_domain}/topojson_finland_simplified.json"
      },
      "topojson_finland_without_aland": {
        "description": "Topography used to render a bubble chart on top of the map of Finland. Based on the open data at https://github.com/lucified/finland-municipalities-topojson, with some post-processing applied.",
        "generated": "2020-04-08T09:00:00.000Z",
        "link": "https://${var.open_data_domain}/topojson_finland_without_aland.json"
      }
    }
  }
    EOF
}
