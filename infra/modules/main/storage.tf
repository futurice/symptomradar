# This bucket contains the stored responses
resource "aws_s3_bucket" "storage" {
  bucket = "${var.name_prefix}-storage"
  tags   = local.tags_storage

  logging {
    target_bucket = var.s3_logs_bucket
    target_prefix = "${var.name_prefix}-storage/"
  }

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

# https://docs.aws.amazon.com/athena/latest/ug/create-table.html
resource "aws_athena_named_query" "create_table" {
  name        = "${var.name_prefix}-create-table"
  description = "Sets up the main table if it doesn't yet exist"
  database    = aws_athena_database.storage.name
  query       = <<-SQL
    CREATE EXTERNAL TABLE IF NOT EXISTS
      ${local.table} (
        `response_id` string,
        `timestamp` string,
        `participant_id` string,
        `app_version` string,
        `fever` string,
        `cough` string,
        `breathing_difficulties` string,
        `muscle_pain` string,
        `headache` string,
        `sore_throat` string,
        `rhinitis` string,
        `general_wellbeing` string,
        `longterm_medication` string,
        `smoking` string,
        `corona_suspicion` string,
        `age_group` string,
        `gender` string,
        `postal_code` string,
        `duration` smallint
     )
    ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
    WITH SERDEPROPERTIES ('serialization.format' = '1')
    LOCATION 's3://${aws_s3_bucket.storage.id}/responses/'
    TBLPROPERTIES ('has_encrypted_data'='false')
    ;
  SQL
}

resource "aws_athena_named_query" "total_responses" {
  name        = "${var.name_prefix}-total-responses"
  description = "How many responses we currently have received"
  database    = aws_athena_database.storage.name
  query       = "SELECT COUNT(*) FROM ${local.table}"
}
