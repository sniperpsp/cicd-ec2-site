#!/bin/bash

# Criar usuário template com senha Te#mpl@te e dar permissões de root
useradd template # criando usuario
echo 'template:Te#mpl@te' | chpasswd # senha do usuario
echo 'root:Dd33557788' | chpasswd # senha do usuario
usermod -aG wheel template # permissão de root para o usuario

# Habilitar login com usuário e senha
sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config  # habilitando acesso com senha via ssh
sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config # habilitando acesso com senha via ssh
sed -i 's/^#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config # habilitando acesso com senha via ssh
sed -i 's/^PermitEmptyPasswords yes/PermitEmptyPasswords no/' /etc/ssh/sshd_config # habilitando acesso com senha via ssh

# Reiniciar o serviço SSH para aplicar as mudanças
systemctl restart sshd

# Instalar Apache e unzip
yum update -y
yum install httpd unzip -y

# Instalar Docker e Git
yum update -y
yum install git -y
yum install docker -y
usermod -a -G docker template
id template
newgrp docker
systemctl start docker
systemctl enable docker

# Parar o serviço Apache para liberar a porta 80
systemctl stop httpd

# Instalar Docker Compose 2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# Validar instalação do Docker Compose
docker-compose version

# Instalar node e npm
curl -fsSL https://rpm.nodesource.com/setup_21.x | bash -
yum install -y nodejs

# Clonar o repositório do GitHub
git clone https://github.com/sniperpsp/cicd-ec2-site.git /mnt/site

# Navegar para a pasta onde o docker-compose.yml está localizado
cd /mnt/site
unzip to-do.zip -d /mnt/site
cd /mnt/site/to-do-Docker-main
mv agenda/ /mnt/site/
cd /mnt/site/
rm -rf to-do-Docker-main/


# Construir as imagens Docker
docker build -t node-todo-app .
docker build -t banco-de-dados -f Dockerfile-postgres .

# Subir os serviços com docker-compose
docker-compose up -d

cd /mnt
ls -la