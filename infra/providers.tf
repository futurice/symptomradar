provider "aws" {
  version = "~> 2.53"
}

# This alias is needed because ACM is only available in the "us-east-1" region
provider "aws" {
  alias   = "us_east_1"
  version = "~> 2.53"
  region  = "us-east-1"
}

provider "random" {
  version = "~> 2.2"
}

provider "archive" {
  version = "~> 1.3"
}

provider "template" {
  version = "~> 2.1"
}

provider "null" {
  version = "~> 2.1"
}
