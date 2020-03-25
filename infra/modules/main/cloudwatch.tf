data "aws_region" "current" {}

resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "${var.name_prefix}-overview"
  dashboard_body = <<EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 24,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Invocations", "FunctionName", "${module.backend_api.function_name}" ]
                ],
                "view": "timeSeries",
                "stacked": true,
                "region": "${data.aws_region.current.name}",
                "title": "API invocations per minute",
                "period": 60,
                "stat": "Sum",
                "annotations": {
                    "vertical": [
                        {
                            "label": "Private beta",
                            "value": "2020-03-25T14:25:36Z"
                        }
                    ]
                }
            }
        }
    ]
}
  EOF
}
