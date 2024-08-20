
## Como Usar

### Criar ou Atualizar o Ambiente

Faça um push para os arquivos `to-do.zip` ou `user_data.sh` para acionar o workflow automaticamente e criar ou atualizar o ambiente.

### Destruir o Ambiente

1. Vá para a aba "Actions" no seu repositório GitHub.
2. Selecione o workflow "Destruir Ambiente".
3. Clique em "Run workflow".
4. Escolha a ação `destroy` no menu suspenso.
5. Clique em "Run workflow" para executar a destruição do ambiente.

## Variáveis

- `ami`: ID da AMI para a instância EC2.
- `instance_type_ec2`: Tipo da instância EC2.
- `tag_name`, `tag_app`, `tag_servico`: Tags para a instância EC2.

## Requisitos

- Terraform >= 1.2.0
- Provedor AWS >= 4.16

## Configuração de Credenciais

As credenciais AWS são configuradas usando segredos do GitHub Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Certifique-se de adicionar esses segredos no seu repositório GitHub.

---

Com essa configuração, você pode gerenciar seu ambiente EC2 de forma eficiente usando Terraform e GitHub Actions, com a flexibilidade de criar, atualizar e destruir o ambiente conforme necessário.