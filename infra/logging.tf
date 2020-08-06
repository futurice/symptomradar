# S3 access logs for our various buckets are stored here
resource "aws_s3_bucket" "s3_logs" {
  bucket = "s3logs-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.name}"
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
        access_control_translation {
          owner = "Destination"
        }
        account_id = var.central_log_vault_account_id
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
        "s3:GetObjectVersionAcl",
        "s3:GetObjectVersionTagging"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.s3_logs.arn}/*"
      ]
    },
    {
      "Action": [
        "s3:ReplicateObject",
        "s3:ReplicateDelete",
        "s3:ReplicateTags",
        "s3:ObjectOwnerOverrideToBucketOwner"
      ],
      "Effect": "Allow",
      "Resource": "${var.central_log_vault_arn}/*"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "replication" {
  role       = aws_iam_role.replication.name
  policy_arn = aws_iam_policy.replication.arn
}
