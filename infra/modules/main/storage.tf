# This bucket contains the stored responses
resource "aws_s3_bucket" "storage" {
  bucket = "${var.name_prefix}-storage"
  tags   = local.tags_storage
}

# This bucket contains result files from Athena queries
resource "aws_s3_bucket" "storage_results" {
  bucket = "${var.name_prefix}-storage-results"
  tags   = local.tags_storage
}

resource "aws_athena_database" "storage" {
  name   = replace("${var.name_prefix}-storage", "/[^a-z0-9_]+/", "_") # only alphanumerics and underscores allowed here
  bucket = aws_s3_bucket.storage_results.id
}

locals {
  table = "${aws_athena_database.storage.id}.responses"
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
        `age` string,
        `gender` string,
        `location` string,
        `feverSymptoms` string,
        `coughSymptoms` string,
        `difficultyBreathing` string,
        `musclePain` string,
        `soreThroat` string,
        `rhinitis` string,
        `generalWellbeing` string,
        `symptomsDuration` string,
        `longTermMedication` string,
        `smoking` string,
        `suspectsCorona` string
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
