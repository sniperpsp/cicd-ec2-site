#Aqui temos as variaveis que estou utilizando, você pode criar mais variaveis para facilitar no script.

variable "tag_name" {
  description = "Nome da instancia"
  type        = string
  default     = "CICD-Template"  
}
variable "tag_app" {
  description = "Nome da instancia"
  type        = string
  default     = "CICD-SITE"  
}
variable "tag_servico" {
  description = "Nome da instancia"
  type        = string
  default     = "CICD-SITE"  
}

variable "ami" {
  description = "Id da AMI que será usada"
  type = string
  default = "ami-0d91c802561cd4176"
  
}

variable "instance_type_ec2"{
  description = "Tipo da instancia usada"
  type = string
  default = "t3.micro"
}

variable "meu_ip" {
  description = "Meu endereço IP atual"
  default     = "45.228.245.0"  # Substitua pelo seu endereço IP atual para ser liberado a fazer ssh na maquina
}

variable "sg1" {
  default = "SG-Terraform"
  description = "Nome do SG que vai ser criado"
  
}

