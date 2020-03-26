# This is the DNS Zone to which we assume we can create DNS records
resource "aws_route53_zone" "oiretutka_fi" {
  name = "oiretutka.fi"
  tags = var.tags
}

# Implements an instance of the app, for a specific env
module "env_dev" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix            = "${var.name_prefix}-dev"
  tags                   = merge(var.tags, { Environment = "dev" })
  frontend_domain        = "dev.oiretutka.fi"
  backend_domain         = "api.dev.oiretutka.fi"
  s3_logs_bucket         = aws_s3_bucket.s3_logs.id
  backend_cors_allow_any = true
}

# Implements an instance of the app, for a specific env
module "env_prod" {
  source    = "./modules/main"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix     = "${var.name_prefix}-prod"
  tags            = merge(var.tags, { Environment = "prod" })
  frontend_domain = "www.oiretutka.fi"
  backend_domain  = "api.oiretutka.fi"
  s3_logs_bucket  = aws_s3_bucket.s3_logs.id
}

# S3 access logs for our various buckets are stored here
resource "aws_s3_bucket" "s3_logs" {
  bucket = "${var.name_prefix}-s3logs-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.name}"
  acl    = "log-delivery-write"
  tags   = var.tags

  versioning {
    enabled = true
  }

  lifecycle_rule {
    id      = "log"
    enabled = true

    expiration {
      days = 730
    }
  }


  replication_configuration {
    role = aws_iam_role.replication.arn

    rules {
      id     = "security-vault"
      status = "Enabled"

      destination {
        bucket = var.central_log_vault_arn
      }
    }
  }
}


resource "aws_iam_role" "replication" {
  name = "${var.name_prefix}-logs-replication"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
POLICY
}

resource "aws_iam_policy" "replication" {
  name = "${var.name_prefix}-logs-replication"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetReplicationConfiguration",
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.s3_logs.arn}"
      ]
    },
    {
      "Action": [
        "s3:GetObjectVersion",
        "s3:GetObjectVersionAcl"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.s3_logs.arn}/*"
      ]
    },
    {
      "Action": [
        "s3:ReplicateObject",
        "s3:ReplicateDelete"
      ],
      "Effect": "Allow",
      "Resource": "${var.central_log_vault_arn}"
    }
  ]
}
POLICY
}


resource "aws_iam_role_policy_attachment" "replication" {
  role       = "${aws_iam_role.replication.name}"
  policy_arn = "${aws_iam_policy.replication.arn}"
}

# Pass along any output from the instantiated module
output "env_dev" {
  value = module.env_dev
}
