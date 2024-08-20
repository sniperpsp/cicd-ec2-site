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
    bucket = var.bucket
    key    = "terraformstate/terraform.tfstate"
    region = "us-east-1"
  }
}

variable "bucket" {
  description = "The name of the S3 bucket to store the Terraform state"
  type        = string
}