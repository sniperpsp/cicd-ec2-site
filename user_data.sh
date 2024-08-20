#!/bin/bash

# Criar usuário template com senha Te#mpl@te e dar permissões de root
useradd template #criando usuario
echo 'template:Te#mpl@te' | chpasswd #senhad o usuario
echo 'root:Dd33557788' | chpasswd #senhad o usuario
usermod -aG wheel template #permissão de root para o usuario

# Habilitar login com usuário e senha
sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config  #habilitando acesso com senha via ssh
sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config #habilitando acesso com senha via ssh
sed -i 's/^#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config #habilitando acesso com senha via ssh
sed -i 's/^PermitEmptyPasswords yes/PermitEmptyPasswords no/' /etc/ssh/sshd_config #habilitando acesso com senha via ssh

# Reiniciar o serviço SSH para aplicar as mudanças
systemctl restart sshd

# Instalar Apache e unzip
sudo yum update -y
sudo yum install httpd unzip -y

#Instalar Docker e Git
sudo yum update -y
sudo yum install git -y
sudo yum install docker -y
sudo usermod -a -G docker template
id template
sudo newgrp docker
sudo systemctl start httpd
sudo systemctl enable httpd
sudo /home/ec2-user/bia/build.sh

# Criar arquivo de configuração do Apache para o site
cat <<EOL | sudo tee /etc/httpd/conf.d/teste1.conf
<VirtualHost *:80>
    DocumentRoot "/var/www/html/teste1"
    ServerName localhost

    <Directory "/var/www/html/teste1">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOL

# Reiniciar o serviço Apache para aplicar as mudanças
sudo systemctl restart httpd

# Ativar docker
sudo systemctl enable docker.service
sudo systemctl start docker.service

# Instalar docker compose 2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Validar instalação do Docker Compose
docker compose version

# Instalar node e npm
curl -fsSL https://rpm.nodesource.com/setup_21.x | sudo bash -
sudo yum install -y nodejs

# Clonar o repositório do GitHub e copiar o conteúdo da pasta 'site' para '/mnt'
git clone https://github.com/seu-usuario/seu-repositorio.git /tmp/sit
cp -r /tmp/seu-repositorio/site /mnt

# Remover a pasta temporária
rm -rf /tmp/seu-repositorio

# Entrar na pasta copiada e iniciar o server.js com o Node.js
cd /mnt/site
npm install  # Instalar dependências do Node.js
node server.js