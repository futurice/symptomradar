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
            "${module.env_dev.storage_result_bucket_arn}/*"
        ]
    }
  ]
}
EOF
}
