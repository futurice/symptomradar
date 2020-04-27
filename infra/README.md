# symptomradar infra

## Getting started

Follow these instructions to set up your environment so that you can contribute to the development of the project.

1. Install Terraform. On macOS, the simplest way is probably `brew install terraform`.
1. Obtain secrets for your `.envrc` file (ask around in the team).
1. Move to the `infra/` dir and run `terraform init` to set up Terraform.
1. You're done!
1. To check, you can run `terraform plan`. It should refresh a bunch of resources, and eventually tell you that "No changes. Infrastructure is up-to-date."

## Initial setup

**IMPORTANT: These are probably not the instructions you're looking for.**

To get started working on our infrastructure, follow the above instructions.

These instructions, by contrast, are for the _initial setup of Symptomradar_ when no infrastructure previously exists.

1. Comment out `backend "s3"`
1. `terraform init`
1. `terraform apply -target aws_s3_bucket.terraform_state -target aws_dynamodb_table.terraform_state_lock`
1. Uncomment `backend "s3"`
1. `terraform init`
1. `terraform apply -target module.env_dev.aws_s3_bucket.backend_code -target aws_route53_zone.oiretutka_fi`
1. `./scripts/deploy-backend dev-tmp` (fails with an error about function missing; this is fine for now)
1. `terraform apply`
1. `./scripts/deploy-frontend dev-tmp`

Manual steps required:

1. For reasons unknown, the Athena result bucket needs to be set manually, even if it's defined in the Terraform config. For the `dev` env for instance, it'd be `s3://symptomradar-dev-storage-results/`.
1. The setup also has CloudFront additional metrics enabled. Currently, this cannot be done through CLI or Terraform.
1. It also creates an IAM user for deploying Lambdas and uploading to S3. However, access keys needs to be created using AWS Console.
1. Some secrets are managed outside of Terraform, [so they don't end up as plain-text in the state file](https://www.terraform.io/docs/providers/aws/r/ssm_parameter.html). Set up the global secret pepper used for hashing `participant_id` before persistence:
   1. `read SECRET && aws ssm put-parameter --type "SecureString" --name "/symptomradar/dev/secret-pepper" --value "$SECRET"`
   1. `read SECRET && aws ssm put-parameter --type "SecureString" --name "/symptomradar/prod/secret-pepper" --value "$SECRET"`
