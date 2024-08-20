#Criação do Security Groupe para a EC2 =)

resource "aws_security_group" "SG1" {
  name        = "${var.sg1}-EC2"
  description = "Security Group para minha aplicacao"
  vpc_id      = aws_vpc.vpc2.id

  // Regras de entrada
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["${var.meu_ip}/24"]  # Usando a variável meu_ip para o seu IP
  }

    // Permitir que o próprio SG se comunique consigo mesmo
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  // Regras de saída
  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    
    Name = var.tag_name
    App = var.tag_app
    Servico = var.tag_servico

  }
}