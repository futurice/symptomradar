# This bucket contains the stored responses
resource "aws_s3_bucket" "storage" {
  bucket = "${var.name_prefix}storage"
}
