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
                        },
                        {
                            "label": "Public beta",
                            "value": "2020-03-26T19:01:00+02:00"
                        }
                    ]
                }
            }
        },
        {
            "type": "metric",
            "x": 6,
            "y": 6,
            "width": 6,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Duration", "FunctionName", "${module.backend_api.function_name}", "Resource", "${module.backend_api.function_name}", { "stat": "Minimum", "label": "Min" } ],
                    [ "...", { "stat": "Average", "label": "Avg" } ],
                    [ "...", { "stat": "p99", "label": "p99" } ],
                    [ "...", { "stat": "Maximum", "label": "Max" } ]
                ],
                "region": "${data.aws_region.current.name}",
                "title": "API call duration",
                "period": 300,
                "view": "timeSeries",
                "stacked": false
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 6,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Errors", "FunctionName", "${module.backend_api.function_name}", "Resource", "${module.backend_api.function_name}", { "id": "errors", "color": "#d13212" } ],
                    [ ".", "Invocations", ".", ".", ".", ".", { "id": "invocations", "visible": false } ],
                    [ { "expression": "100 - 100 * errors / MAX([errors, invocations])", "label": "Success rate (%)", "id": "availability", "yAxis": "right", "region": "${data.aws_region.current.name}", "visible": false } ]
                ],
                "region": "${data.aws_region.current.name}",
                "title": "API error count",
                "yAxis": {
                    "right": {
                        "max": 100
                    }
                },
                "period": 300,
                "view": "timeSeries",
                "stacked": false,
                "stat": "Sum"
            }
        },
        {
            "type": "metric",
            "x": 18,
            "y": 6,
            "width": 6,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Throttles", "FunctionName", "${module.backend_api.function_name}", "Resource", "${module.backend_api.function_name}", { "stat": "Sum" } ]
                ],
                "region": "${data.aws_region.current.name}",
                "title": "API throttles"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 6,
            "width": 6,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "ConcurrentExecutions", "FunctionName", "${module.backend_api.function_name}", "Resource", "${module.backend_api.function_name}", { "stat": "Maximum" } ]
                ],
                "region": "${data.aws_region.current.name}",
                "title": "Concurrent API executions"
            }
        },
        {
            "type": "metric",
            "x": 6,
            "y": 12,
            "width": 6,
            "height": 6,
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": [
                    [ "AWS/ApiGateway", "Latency", "ApiName", "${module.backend_api.resources.rest_api}" ]
                ],
                "region": "${data.aws_region.current.name}",
                "title": "API Gateway latency"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 12,
            "width": 6,
            "height": 6,
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": [
                    [ "AWS/CloudFront", "Requests", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}" ]
                ],
                "region": "us-east-1",
                "title": "CloudFront requests",
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "stat": "Sum"
            }
        },
        {
            "type": "metric",
            "x": 18,
            "y": 12,
            "width": 6,
            "height": 6,
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": [
                    [ "AWS/CloudFront", "TotalErrorRate", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}" ],
                    [ "AWS/CloudFront", "4xxErrorRate", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}", { "label": "Total4xxErrors", "region": "us-east-1" } ],
                    [ "AWS/CloudFront", "5xxErrorRate", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}", { "label": "Total5xxErrors", "region": "us-east-1" } ],
                    [ { "expression": "(m4+m5+m6)/m7*100", "label": "5xxErrorByLambdaEdge", "id": "e1", "region": "us-east-1" } ],
                    [ "AWS/CloudFront", "LambdaExecutionError", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}", { "id": "m4", "stat": "Sum", "visible": false, "region": "us-east-1" } ],
                    [ "AWS/CloudFront", "LambdaValidationError", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}", { "id": "m5", "stat": "Sum", "visible": false, "region": "us-east-1" } ],
                    [ "AWS/CloudFront", "LambdaLimitExceededErrors", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}", { "id": "m6", "stat": "Sum", "visible": false, "region": "us-east-1" } ],
                    [ "AWS/CloudFront", "Requests", "Region", "Global", "DistributionId", "${module.frontend.resources.cloudfront_distribution}", { "id": "m7", "stat": "Sum", "visible": false, "region": "us-east-1" } ]
                ],
                "region": "us-east-1",
                "title": "CloudFront Error rate (% of requests)",
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                }
            }
        }
    ]
}
  EOF
}
