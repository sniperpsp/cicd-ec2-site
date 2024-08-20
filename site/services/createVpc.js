const AWS = require('aws-sdk');

async function createVpc(ec2, tags) {
  const vpcId = await ec2.createVpc({
    CidrBlock: '172.0.0.0/16',
    TagSpecifications: [
      {
        ResourceType: 'vpc',
        Tags: tags ? tags.map(tag => ({ Key: tag.key, Value: tag.value })) : []
      }
    ]
  }).promise().then(data => data.Vpc.VpcId);

  // Habilitar suporte a DNS e hostnames
  await ec2.modifyVpcAttribute({ VpcId: vpcId, EnableDnsSupport: { Value: true } }).promise();
  await ec2.modifyVpcAttribute({ VpcId: vpcId, EnableDnsHostnames: { Value: true } }).promise();

  // Criação do Internet Gateway
  const igwId = await ec2.createInternetGateway({
    TagSpecifications: [
      {
        ResourceType: 'internet-gateway',
        Tags: tags ? tags.map(tag => ({ Key: tag.key, Value: tag.value })) : []
      }
    ]
  }).promise().then(data => data.InternetGateway.InternetGatewayId);

  // Anexar o Internet Gateway à VPC
  await ec2.attachInternetGateway({ VpcId: vpcId, InternetGatewayId: igwId }).promise();

  // Obter o ID da tabela de rotas principal da VPC
  const routeTableId = await ec2.describeRouteTables({
    Filters: [
      { Name: 'vpc-id', Values: [vpcId] },
      { Name: 'association.main', Values: ['true'] }
    ]
  }).promise().then(data => data.RouteTables[0].RouteTableId);

  // Criação da rota padrão na tabela de rotas principal da VPC
  await ec2.createRoute({
    RouteTableId: routeTableId,
    DestinationCidrBlock: '0.0.0.0/0',
    GatewayId: igwId
  }).promise();

  // Criação da Subnet
  const snId = await ec2.createSubnet({
    VpcId: vpcId,
    CidrBlock: '172.0.1.0/24',
    TagSpecifications: [
      {
        ResourceType: 'subnet',
        Tags: tags ? tags.map(tag => ({ Key: tag.key, Value: tag.value })) : []
      }
    ]
  }).promise().then(data => data.Subnet.SubnetId);

  return { vpcId, snId };
}

module.exports = createVpc;