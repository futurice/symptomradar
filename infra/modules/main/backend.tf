# This bucket contains the backend code
resource "aws_s3_bucket" "backend_code" {
  bucket = "${var.name_prefix}-backend-code"
  tags   = local.tags_backend

  logging {
    target_bucket = var.s3_logs_bucket
    target_prefix = "${var.name_prefix}-backend-code/"
  }

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
    BUCKET_NAME_STORAGE        = aws_s3_bucket.storage.id
    BUCKET_NAME_ATHENA_RESULTS = aws_s3_bucket.storage_results.id
    CORS_ALLOW_ORIGIN          = var.backend_cors_allow_any ? "*" : "https://${var.frontend_domain}"
    KNOWN_HASHING_PEPPER       = var.known_hashing_pepper
    SSM_SECRETS_PREFIX         = var.ssm_secrets_prefix
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
  function_timeout       = 60 * 5             # i.e. 5 minutes
  schedule_expression    = "rate(15 minutes)" # note: full cron expressions are also supported
  lambda_logging_enabled = true

  function_env_vars = {
    BUCKET_NAME_STORAGE        = aws_s3_bucket.storage.id
    BUCKET_NAME_ATHENA_RESULTS = aws_s3_bucket.storage_results.id
    ATHENA_DB_NAME             = aws_athena_database.storage.name
    BUCKET_NAME_OPEN_DATA      = aws_s3_bucket.open_data.id
    KNOWN_HASHING_PEPPER       = var.known_hashing_pepper
    DOMAIN_NAME_OPEN_DATA      = var.open_data_domain
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

# Attach the required extra permissions to the backend worker function
resource "aws_iam_policy" "backend_worker" {
  name = "${var.name_prefix}-backend-worker-extras"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlyAccessToResultsStorage",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::${aws_s3_bucket.storage.id}",
        "arn:aws:s3:::${aws_s3_bucket.storage.id}/*"
      ],
      "Effect": "Allow"
    },
    {
      "Sid": "ReadWriteAccessToAthenaResultsAndOutputBucket",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::${aws_s3_bucket.open_data.id}",
        "arn:aws:s3:::${aws_s3_bucket.open_data.id}/*",
        "arn:aws:s3:::${aws_s3_bucket.storage_results.id}",
        "arn:aws:s3:::${aws_s3_bucket.storage_results.id}/*"
      ],
      "Effect": "Allow"
    },
    {
      "Sid": "AllowQueryingAthena",
      "Action": [
        "athena:*"
      ],
      "Resource": [
        "arn:aws:athena:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:workgroup/primary"
      ],
      "Effect": "Allow"
    },
    {
      "Sid": "AllowUsingGlue",
      "Action": [
        "glue:*"
      ],
      "Resource": [
        "arn:aws:glue:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:catalog",
        "arn:aws:glue:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:database/${aws_athena_database.storage.name}",
        "arn:aws:glue:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${aws_athena_database.storage.name}/responses"
      ],
      "Effect": "Allow"
    }
  ]
}
EOF
}

# Attach the required extra permissions to the backend worker function
resource "aws_iam_role_policy_attachment" "backend_worker" {
  role       = module.backend_worker.function_role
  policy_arn = aws_iam_policy.backend_worker.arn
}
