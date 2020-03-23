# symptomradar infra

1. Comment out `backend "s3"`
1. `terraform init`
1. `terraform apply -target aws_s3_bucket.terraform_state -target aws_dynamodb_table.terraform_state_lock`
1. Uncomment `backend "s3"`
1. `terraform init`
1. `terraform apply -target module.env_dev.aws_s3_bucket.backend_code -target aws_route53_zone.oiretutka_fi`
1. `./scripts/deploy-backend dev-tmp` (fails with an error about function missing; this is fine for now)
1. `terraform apply`
1. `./scripts/deploy-frontend dev-tmp`

For reasons unknown, the Athena result bucket needs to be set manually, even if it's defined in the Terraform config. For the `dev` env for instance, it'd be `s3://symptomradar-dev-storage-results/`.
