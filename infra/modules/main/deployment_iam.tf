resource "aws_iam_user" "lambda_deployment" {
  name = "${var.name_prefix}-lambda-deployment"
  tags = var.tags

}

resource "aws_iam_access_key" "lambda_deployment" {
  user = aws_iam_user.lambda_deployment.name
}

resource "aws_iam_user_policy" "lambda_deployment" {
  name = "${var.name_prefix}-lambda-deployment"
  user = aws_iam_user.lambda_deployment.name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
    "Action": [
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Resource": [
          "arn:aws:s3:::${aws_s3_bucket.frontend_code.id}",
          "arn:aws:s3:::${aws_s3_bucket.backend_code.id}"
          ]
    },
    {
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": [
          "arn:aws:s3:::${aws_s3_bucket.frontend_code.id}/*",
          "arn:aws:s3:::${aws_s3_bucket.backend_code.id}/*"
          ]
    },
    {
    "Action": [
        "lambda:UpdateFunctionCode"
      ],
      "Effect": "Allow",
      "Resource": [
          "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${module.backend_api.function_name}",
          "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${module.backend_worker.function_name}"
          ]
    }
  ]
}
EOF
}
