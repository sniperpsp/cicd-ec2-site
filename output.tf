#Saidas que vão ser apresentadas

output "key_name" {
    description = "Nome da chave SSH usada"
    value       = aws_instance.ec2_tf.key_name
}

output "ec2_public_dns" {
    description = "DNS público da instância EC2"
    value       = aws_instance.ec2_tf.public_dns
}

output "ec2_user" {
    description = "Usuário padrão da instância EC2"
    value       = "template"  # Substitua pelo usuário correto se necessário
}