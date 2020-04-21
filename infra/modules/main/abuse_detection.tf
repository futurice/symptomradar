# This table is used as a key/value store by the abuse detection subsystem
resource "aws_dynamodb_table" "abuse_detection" {
  name         = "${var.name_prefix}-abuse-detection"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "ADKey"
  tags         = local.tags_backend

  attribute {
    name = "ADKey"
    type = "S"
  }

  ttl {
    attribute_name = "ADTtl"
    enabled        = true
  }
}
