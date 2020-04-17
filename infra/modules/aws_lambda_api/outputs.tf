output "function_name" {
  description = "This is the unique name of the Lambda function that was created"
  value       = local.function_id
}

output "web_endpoint" {
  description = "This URL can be used to invoke the Lambda through the API Gateway"
  value       = var.api_domain == "" ? aws_api_gateway_deployment.this.invoke_url : "https://${var.api_domain}/"
}

output "function_role" {
  value       = aws_iam_role.this.name
  description = "The IAM role for the function created; can be used to attach additional policies/permissions"
}

output "rest_api_name" {
  description = "Name of the API Gateway API that was created"
  value       = aws_api_gateway_rest_api.this.name
}
