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

  logging {
    target_bucket = var.s3_logs_bucket
    target_prefix = "${var.name_prefix}-frontend-code/"
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
  basic_auth_username        = var.frontend_password == "" ? "" : "symptomradar"
  basic_auth_password        = var.frontend_password

  add_response_headers = {

    # Add basic security headers:
    Strict-Transport-Security = "max-age=31536000" # the page should ONLY be accessed using HTTPS, instead of using HTTP (max-age == one year)
    X-Content-Type-Options    = "nosniff"          # the MIME types advertised in the Content-Type headers should ALWAYS be followed; this allows to opt-out of MIME type sniffing
    X-XSS-Protection          = "1; mode=block"    # stops pages from loading when they detect reflected cross-site scripting (XSS) attacks; besides legacy browsers, superseded by CSP
    Referrer-Policy           = "same-origin"      # a referrer will be sent for same-site origins, but cross-origin requests will send no referrer information

    # Add CSP header:
    # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    Content-Security-Policy = replace(replace(replace(<<-EOT

      default-src # serves as a fallback for the other CSP fetch directives; for many of the following directives, if they are absent, the user agent will look for the default-src directive and will use this value for it
        'none' # by default, don't allow anything; we'll specifically white-list things below
        ;
      block-all-mixed-content # prevents loading any assets using HTTP when the page is loaded using HTTPS
        ;
      connect-src # restricts the URLs which can be loaded using script interfaces (e.g. XHR, WebSocket)
        ${var.backend_domain} # allow connecting to the backend for this environment (but not others!)
        ;
      form-action # restricts the URLs which can be used as the target of a form submission
        'none' # for better or worse, all our forms are JavaScript-only -> we can prohibit all normal form submission
        ;
      img-src # specifies valid sources of images and favicons
        'self' # allow regular images that ship with the UI
        data: # allow small assets which have been inlined by webpack
        ;
      font-src # specifies valid sources of webfonts
        'self' # allow loading self-hosted fonts, but not e.g. directly from Google Fonts for privacy reasons
        ;
      manifest-src # specifies which manifest can be applied to the resource
        'self' # our manifest is always on our own domain
        ;
      navigate-to # restricts the URLs to which a document can initiate navigations by any means including <form> (if form-action is not specified), <a>, window.location, window.open, etc
        'self' # allow navigating within our own site, but not anywhere else
        ;
      prefetch-src # specifies valid resources that may be prefetched or prerendered
        'none' # we don't currently have any <link rel="prefetch" /> or the like -> prohibit until we do
        ;
      script-src # specifies valid sources for JavaScript; this includes not only URLs loaded directly into <script> elements, but also things like inline script event handlers (onclick) and XSLT stylesheets which can trigger script execution
        'self' # allow our own scripts
        ;
      script-src-attr # specifies valid sources for JavaScript inline event handlers; this includes only inline script event handlers like onclick, but not URLs loaded directly into <script> elements
        'none' # we don't use any inline event handlers, only proper <script> elements -> prohibit them all
        ;
      style-src # specifies valid sources for stylesheets
        'self' # allow our CSS bundle
        'unsafe-inline' # this is needed for our CSS-in-JS solution to work (https://styled-components.com/)
        ;
      style-src-attr # specifies valid sources for inline styles applied to individual DOM elements
        'none' # we don't currently use any -> prohibit them all
        ;
      frame-src # Specifies valid sources for nested browsing contexts loading using elements such as <frame> and <iframe>.
        'self'  
        ;

EOT
    , "/#.*/", " "), "/[ \n]+/", " "), " ;", ";") # strip out comments and newlines, and collapse consecutive whitespace so it looks pleasant

  }
}
