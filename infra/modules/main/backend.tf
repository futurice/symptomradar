# This bucket contains the backend code
resource "aws_s3_bucket" "backend_code" {
  bucket = "${var.name_prefix}-backend-code"
  tags   = local.tags_backend

  logging {
    target_bucket = var.s3_logs_bucket
    target_prefix = "${var.name_prefix}-backend-code/"
  }

}

# Create random, secret pepper we can use for hashing
resource "random_string" "secret_hashing_pepper" {
  length  = 32
  special = false
}

# Implements the Lambda API processing requests from the web
module "backend_api" {
  source    = "../aws_lambda_api"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix                    = "${var.name_prefix}-backend-api"
  tags                           = local.tags_backend
  api_domain                     = var.backend_domain
  function_s3_bucket             = aws_s3_bucket.backend_code.id
  function_zipfile               = "backend-lambda.zip"
  function_handler               = "index.apiEntrypoint"
  lambda_logging_enabled         = true
  api_gateway_cloudwatch_metrics = true

  function_env_vars = {
    BUCKET_NAME_STORAGE   = aws_s3_bucket.storage.id
    CORS_ALLOW_ORIGIN     = var.backend_cors_allow_any ? "*" : "https://${var.frontend_domain}"
    SECRET_HASHING_PEPPER = random_string.secret_hashing_pepper.result
    SSM_SECRETS_PREFIX    = var.ssm_secrets_prefix
  }
}

module "backend_worker" {
  source = "../aws_lambda_cronjob"

  name_prefix            = "${var.name_prefix}-backend-worker"
  tags                   = local.tags_backend
  cronjob_name           = "function"
  function_s3_bucket     = aws_s3_bucket.backend_code.id
  function_zipfile       = "backend-lambda.zip"
  function_handler       = "index.workerEntrypoint"
  schedule_expression    = "rate(3 minutes)" # note: full cron expressions are also supported
  lambda_logging_enabled = true

  function_env_vars = {
    BUCKET_NAME_STORAGE = aws_s3_bucket.storage.id
  }
}

# Attach the required extra permissions to the backend API function
resource "aws_iam_policy" "backend_api" {
  name = "${var.name_prefix}-backend-api-extras"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
   {
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::${aws_s3_bucket.storage.id}",
        "arn:aws:s3:::${aws_s3_bucket.storage.id}/*"
      ],
      "Effect": "Allow"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_secrets_prefix}secret-pepper"
    }
  ]
}
EOF
}

# Attach the required extra permissions to the backend API function
resource "aws_iam_role_policy_attachment" "backend_api" {
  role       = module.backend_api.function_role
  policy_arn = aws_iam_policy.backend_api.arn
}
