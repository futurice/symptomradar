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
        response_id string,
        timestamp string,
        participant_id string,
        app_version string,
        country_code string,
        fever string,
        cough string,
        breathing_difficulties string,
        muscle_pain string,
        headache string,
        sore_throat string,
        rhinitis string,
        stomach_issues string,
        sensory_issues string,
        healthcare_contact string,
        general_wellbeing string,
        longterm_medication string,
        smoking string,
        corona_suspicion string,
        age_group string,
        gender string,
        postal_code string,
        duration smallint,
        abuse_score struct<
          source_ip:smallint,
          user_agent:smallint,
          forwarded_for:smallint
        >
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

resource "aws_athena_named_query" "total_participants" {
  name        = "${var.name_prefix}-total-participants"
  description = "How many people have responded"
  database    = aws_athena_database.storage.name
  query       = "SELECT COUNT(DISTINCT participant_id) AS distinct_participants FROM ${local.table}"
}

resource "aws_athena_named_query" "by_postal_code" {
  name        = "${var.name_prefix}-by-postal-code"
  description = "How many participants per postal code"
  database    = aws_athena_database.storage.name
  query       = "SELECT postal_code, COUNT(*) AS responses FROM ${local.table} GROUP BY postal_code ORDER BY responses DESC"
}

resource "aws_athena_named_query" "by_country_code" {
  name        = "${var.name_prefix}-by-country-code"
  description = "How many participants per country code"
  database    = aws_athena_database.storage.name
  query       = "SELECT country_code, COUNT(*) AS responses FROM ${local.table} GROUP BY country_code ORDER BY responses DESC"
}

resource "aws_athena_named_query" "by_day" {
  name        = "${var.name_prefix}-by-day"
  description = "How many responses per day"
  database    = aws_athena_database.storage.name
  query       = <<-SQL
    SELECT
      day,
      COUNT(*) AS responses
    FROM (
      SELECT SUBSTR(timestamp, 1, 10) AS day FROM ${local.table}
    )
    GROUP BY day
    ORDER BY day
    ;
  SQL
}

resource "aws_athena_named_query" "returning_participants" {
  name        = "${var.name_prefix}-returning-participants"
  description = "How often do participants return to update their answers"
  database    = aws_athena_database.storage.name
  query       = <<-SQL
    SELECT response_count, COUNT(*) AS participants_with_this_many_responses FROM (
      SELECT participant_id, COUNT(*) AS response_count FROM responses GROUP BY participant_id
    ) GROUP BY response_count ORDER BY response_count DESC
    ;
  SQL
}

# Example: Interacting with JSON
# Based on: https://docs.aws.amazon.com/athena/latest/ug/extracting-data-from-JSON.html
# See also: https://aws.amazon.com/blogs/big-data/create-tables-in-amazon-athena-from-nested-json-and-mappings-using-jsonserde/ for how to do this during CREATE TABLE
/*
WITH dataset AS (
  SELECT
    '{"name": "Susan Smith",
      "org": "engineering",
      "project": {"name":"project1", "completed":false}}' AS blob
)
SELECT
  json_extract(blob, '$.name') AS name,
  json_extract(blob, '$.project.name') AS project
FROM
  dataset
WHERE
  json_extract_scalar(blob, '$.project.name') = 'project1'
*/
