const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const createVpc = require('./services/createVpc');
const createEc2 = require('./services/createEc2');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/create-aws-resources', async (req, res) => {
  const { accessKeyId, secretAccessKey, region, createVpc: createVpcFlag, createEc2: createEc2Flag, ec2Params } = req.body;

  console.log('Received request:', req.body); // Log the received request

  // Configura as credenciais da AWS
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
  });

  const ec2 = new AWS.EC2();

  try {
    let vpcId = null;
    let snId = ec2Params.subnetId;

    if (createVpcFlag) {
      const vpcData = await createVpc(ec2, ec2Params.tags);
      vpcId = vpcData.vpcId;
      snId = vpcData.snId; // Use the subnet ID from the created VPC
      console.log('Created VPC:', vpcData); // Log the created VPC data
    }

    if (createEc2Flag) {
      console.log('EC2 Params:', ec2Params); // Log the EC2 parameters
      const instances = await createEc2(ec2, ec2Params.ami, ec2Params.instanceType, ec2Params.associatePublicIp, ec2Params.disableApiTermination, snId, ec2Params.securityGroups, ec2Params.userData, ec2Params.iamInstanceProfile, ec2Params.rootBlockDevice, ec2Params.tags);
      console.log('Created EC2 instances:', instances); // Log the created EC2 instances
      res.send({ instances });
    } else {
      res.send({ message: 'VPC and dependencies created successfully' });
    }
  } catch (error) {
    console.error('Error creating resources:', error); // Log the error
    res.status(500).send({ error: error.message });
  }
});

app.post('/destroy-aws-resources', async (req, res) => {
  const { accessKeyId, secretAccessKey, region, vpcId, instanceId } = req.body;

  console.log('Received destroy request:', req.body); // Log the received request

  // Configura as credenciais da AWS
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
  });

  const ec2 = new AWS.EC2();

  try {
    if (instanceId) {
      // Terminar a instância EC2
      await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
      await ec2.waitFor('instanceTerminated', { InstanceIds: [instanceId] }).promise();

      console.log('Terminated EC2 instance:', instanceId); // Log the terminated EC2 instance
    }

    if (vpcId) {
      // Listar e excluir sub-redes associadas à VPC
      const subnetIds = await ec2.describeSubnets({
        Filters: [
          { Name: 'vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.Subnets.map(subnet => subnet.SubnetId));

      for (const subnetId of subnetIds) {
        await ec2.deleteSubnet({ SubnetId: subnetId }).promise();
      }

      // Listar e excluir gateways de internet associados à VPC
      const internetGatewayIds = await ec2.describeInternetGateways({
        Filters: [
          { Name: 'attachment.vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.InternetGateways.map(igw => igw.InternetGatewayId));

      for (const igwId of internetGatewayIds) {
        await ec2.detachInternetGateway({ InternetGatewayId: igwId, VpcId: vpcId }).promise();
        await ec2.deleteInternetGateway({ InternetGatewayId: igwId }).promise();
      }

      // Listar e excluir tabelas de roteamento associadas à VPC, exceto a tabela de roteamento principal
      const routeTableIds = await ec2.describeRouteTables({
        Filters: [
          { Name: 'vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.RouteTables.filter(rt => !rt.Associations.some(assoc => assoc.Main)).map(rt => rt.RouteTableId));

      for (const rtId of routeTableIds) {
        await ec2.deleteRouteTable({ RouteTableId: rtId }).promise();
      }

      // Listar e excluir ACLs de rede associadas à VPC, exceto a ACL de rede padrão
      const networkAclIds = await ec2.describeNetworkAcls({
        Filters: [
          { Name: 'vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.NetworkAcls.filter(acl => !acl.IsDefault).map(acl => acl.NetworkAclId));

      for (const aclId of networkAclIds) {
        await ec2.deleteNetworkAcl({ NetworkAclId: aclId }).promise();
      }

      // Listar e excluir grupos de segurança associados à VPC, exceto o grupo padrão
      const securityGroupIds = await ec2.describeSecurityGroups({
        Filters: [
          { Name: 'vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.SecurityGroups.filter(sg => sg.GroupName !== 'default').map(sg => sg.GroupId));

      for (const sgId of securityGroupIds) {
        await ec2.deleteSecurityGroup({ GroupId: sgId }).promise();
      }

      // Listar e excluir interfaces de rede associadas à VPC
      const networkInterfaceIds = await ec2.describeNetworkInterfaces({
        Filters: [
          { Name: 'vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.NetworkInterfaces.map(ni => ni.NetworkInterfaceId));

      for (const niId of networkInterfaceIds) {
        await ec2.deleteNetworkInterface({ NetworkInterfaceId: niId }).promise();
      }

      // Listar e excluir endpoints de VPC associados à VPC
      const endpointIds = await ec2.describeVpcEndpoints({
        Filters: [
          { Name: 'vpc-id', Values: [vpcId] }
        ]
      }).promise().then(data => data.VpcEndpoints.map(endpoint => endpoint.VpcEndpointId));

      for (const endpointId of endpointIds) {
        await ec2.deleteVpcEndpoints({ VpcEndpointIds: [endpointId] }).promise();
      }

      // Finalmente, excluir a VPC
      await ec2.deleteVpc({ VpcId: vpcId }).promise();

      console.log('Deleted VPC and all associated resources:', vpcId); // Log the deleted VPC
      res.send({ message: 'VPC and all associated resources deleted successfully' });
    } else {
      res.status(400).send({ error: 'Please provide either vpcId or instanceId' });
    }
  } catch (error) {
    console.error('Error destroying resources:', error); // Log the error
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});