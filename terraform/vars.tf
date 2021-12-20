variable "AWS_REGION" {
  # Ireland
  default = "eu-west-1"
}

variable "AWS_PROFILE" {
  # the default is default on aws
  default = "dev"
}
variable "AMIS" {
  type    = map(string)
  default = {
    eu-west-1 = "ami-04dd4500af104442f"
  }
}

variable "PATH_TO_PRIVATE_KEY" {
  default = "mykey"
}

variable "PATH_TO_PUBLIC_KEY" {
  default = "mykey.pub"
}