# This bucket contains the stored responses
resource "aws_s3_bucket" "storage" {
  bucket = "${var.name_prefix}storage"
}

resource "aws_athena_database" "storage" {
  name   = "responses"
  bucket = aws_s3_bucket.storage.bucket
}

locals {
  table = "${aws_athena_database.storage.id}.vigilant_sniffle_dev_responses"
}

resource "aws_athena_named_query" "create_response_table" {
  name        = "create_response_table"
  description = "Sets up the main table if it doesn't yet exist"
  database    = aws_athena_database.storage.name
  query       = <<-SQL
    CREATE EXTERNAL TABLE IF NOT EXISTS
      ${local.table} (
        `uuid` string,
        `timestamp` string,
        `firstName` string,
        `favoriteColor` string
      )
    ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
    WITH SERDEPROPERTIES ('serialization.format' = '1')
    LOCATION 's3://${aws_s3_bucket.storage.id}/responses/'
    TBLPROPERTIES ('has_encrypted_data'='false')
    ;
  SQL
}

resource "aws_athena_named_query" "responses_per_color" {
  name        = "responses_per_color"
  description = "Shows how many people like a specific color"
  database    = aws_athena_database.storage.name
  query       = <<-SQL
    SELECT
      favoriteColor,
      COUNT(*) AS count
    FROM
      ${local.table}
    GROUP BY
      favoriteColor
   ;
  SQL
}
