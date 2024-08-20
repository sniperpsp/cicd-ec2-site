#Criação da VPC nova para a ec2 junto com um internet gateway

resource "aws_vpc" "vpc2" {
  cidr_block = "172.0.0.0/16"

  enable_dns_support   = true #Habilitando suporte a dns para user no rds
  enable_dns_hostnames = true #Habilitando suporte a dns para user no rds
  # Outros parâmetros do VPC podem ser adicionados aqui

  tags = {
    Name = var.tag_name
    App = var.tag_app
    Servico = var.tag_servico
  }
}

resource "aws_internet_gateway" "igw_terraform" {
  vpc_id = aws_vpc.vpc2.id  
}

#liberando a sainda na route table da vpc criada
resource "aws_route" "default_route" {
  route_table_id         = aws_vpc.vpc2.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw_terraform.id
}