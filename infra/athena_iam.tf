resource "aws_iam_group" "athena_developers" {
  name = "${var.name_prefix}-athena-developers"
}

resource "aws_iam_group_policy" "athena_developers" {
  name  = "${var.name_prefix}-athena-access"
  group = aws_iam_group.athena_developers.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Action": [
            "athena:*"
        ],
        "Effect": "Allow",
        "Resource": "*"
    },
    {
        "Action": [
            "glue:CreateDatabase",
            "glue:DeleteDatabase",
            "glue:GetDatabase",
            "glue:GetDatabases",
            "glue:UpdateDatabase",
            "glue:CreateTable",
            "glue:DeleteTable",
            "glue:BatchDeleteTable",
            "glue:UpdateTable",
            "glue:GetTable",
            "glue:GetTables",
            "glue:BatchCreatePartition",
            "glue:CreatePartition",
            "glue:DeletePartition",
            "glue:BatchDeletePartition",
            "glue:UpdatePartition",
            "glue:GetPartition",
            "glue:GetPartitions",
            "glue:BatchGetPartition"
        ],
        "Effect": "Allow",
        "Resource": "*"
    },
    {
        "Action": [
            "s3:GetBucketLocation",
            "s3:GetObject",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:ListMultipartUploadParts",
            "s3:AbortMultipartUpload",
            "s3:CreateBucket",
            "s3:PutObject"
        ],
        "Effect": "Allow",
        "Resource": [
            "${module.env_dev.storage_bucket_arn}",
            "${module.env_dev.storage_bucket_arn}/*",
            "${module.env_dev.storage_result_bucket_arn}",
            "${module.env_dev.storage_result_bucket_arn}/*",
            "${module.env_prod.storage_bucket_arn}",
            "${module.env_prod.storage_bucket_arn}/*",
            "${module.env_prod.storage_result_bucket_arn}",
            "${module.env_prod.storage_result_bucket_arn}/*"
        ]
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "iam_fine_tune" {
  statement {
    sid = "AllowViewAccountInfo"
    actions = [
      "iam:ListAccountAliases",
      "iam:GetAccountPasswordPolicy",
      "iam:GetAccountSummary",
      "iam:ListUsers",
      "iam:ListVirtualMFADevices"
    ]
    resources = ["*"]
    effect    = "Allow"
  }
  statement {
    sid = "AllowManageOwnAccount"
    actions = [
      "iam:ChangePassword",
      "iam:GetUser",
      "iam:CreateAccessKey",
      "iam:DeleteAccessKey",
      "iam:ListAccessKeys",
      "iam:UpdateAccessKey",
      "iam:CreateLoginProfile",
      "iam:DeleteLoginProfile",
      "iam:GetLoginProfile",
      "iam:UpdateLoginProfile"
    ]
    resources = ["arn:aws:iam::*:user/$${aws:username}"]
    effect    = "Allow"
  }
  statement {
    sid = "AllowManageOwnVirtualMFADevice"
    actions = [
      "iam:DeactivateMFADevice",
      "iam:EnableMFADevice",
      "iam:ListMFADevices",
      "iam:ResyncMFADevice"
    ]
    resources = [
      "arn:aws:iam::*:user/$${aws:username}"
    ]
    effect = "Allow"
  }
  statement {
    sid = "AllowManageOwnUserMFA"
    actions = [
      "iam:CreateVirtualMFADevice",
      "iam:DeleteVirtualMFADevice"
    ]
    resources = [
      "arn:aws:iam::*:mfa/$${aws:username}"
    ]
    effect = "Allow"
  }
  statement {
    sid = "DenyAllExceptListedIfNoMFA"
    not_actions = [
      "iam:CreateVirtualMFADevice",
      "iam:EnableMFADevice",
      "iam:GetUser",
      "iam:ListMFADevices",
      "iam:ListVirtualMFADevices",
      "iam:ResyncMFADevice",
      "sts:GetSessionToken"
    ]
    resources = ["*"]
    condition {
      test     = "BoolIfExists"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["false"]
    }
    effect = "Deny"
  }
}

resource "aws_iam_policy" "iam_fine_tune" {
  name   = "${var.name_prefix}-iam-fine-tune"
  policy = data.aws_iam_policy_document.iam_fine_tune.json
}

resource "aws_iam_group_policy_attachment" "iam_fine_tune_athena_user" {
  group      = aws_iam_group.athena_developers.name
  policy_arn = aws_iam_policy.iam_fine_tune.arn
}
