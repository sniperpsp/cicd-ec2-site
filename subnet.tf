#Criando subnet na vpc criada, aqui 

resource "aws_subnet" "subnet1" {
  vpc_id            = aws_vpc.vpc2.id
  cidr_block        = "172.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name     = var.tag_name
    App      = var.tag_app
    Servico  = var.tag_servico
  }
}

resource "aws_route_table_association" "subnet1_association" {
  subnet_id      = aws_subnet.subnet1.id
  route_table_id = aws_vpc.vpc2.main_route_table_id
}

#Exemplo de criação de uma segunda subnet (descomentando as linhas abaixo)
resource "aws_subnet" "subnet2" {
   vpc_id            = aws_vpc.vpc2.id
   cidr_block        = "172.0.2.0/24"
   availability_zone = "us-east-1b"
   tags = {
     Name     = "${var.tag_name}-2"
     App      = var.tag_app
     Servico  = var.tag_servico
   }
 }

 resource "aws_route_table_association" "subnet2_association" {
   subnet_id      = aws_subnet.subnet2.id
   route_table_id = aws_vpc.vpc2.main_route_table_id
 }