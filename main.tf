terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

terraform {
  backend "s3" {
    bucket = "bucket-teste124"
    key    = "terraformstate/terraform.tfstate"
    region = "us-east-1"
  }
}