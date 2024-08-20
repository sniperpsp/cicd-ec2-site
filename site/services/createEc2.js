const AWS = require('aws-sdk');

async function createEc2(ec2, ami, instanceType, associatePublicIp, disableApiTermination, subnetId, securityGroups, userData, iamInstanceProfile, rootBlockDevice, tags, keyName) {
  // Parâmetros para criar a instância EC2
  const params = {
    ImageId: ami, // Certifique-se de que o parâmetro ImageId está presente
    InstanceType: instanceType,
    MinCount: 1,
    MaxCount: 1,
    NetworkInterfaces: associatePublicIp ? [{
      AssociatePublicIpAddress: true,
      DeviceIndex: 0,
      SubnetId: subnetId || undefined,
      Groups: securityGroups ? [securityGroups] : undefined
    }] : undefined,
    DisableApiTermination: disableApiTermination || undefined,
    IamInstanceProfile: iamInstanceProfile ? { Name: iamInstanceProfile } : undefined,
    BlockDeviceMappings: rootBlockDevice ? [{
      DeviceName: '/dev/sda1',
      Ebs: {
        VolumeType: rootBlockDevice.volumeType,
        VolumeSize: rootBlockDevice.volumeSize
      }
    }] : undefined,
    TagSpecifications: tags ? [{
      ResourceType: 'instance',
      Tags: tags.map(tag => ({ Key: tag.key, Value: tag.value }))
    }] : undefined
  };

  // Adiciona o campo KeyName se fornecido
  if (keyName) {
    params.KeyName = keyName;
  }

  // Adiciona o campo UserData se fornecido
  if (userData) {
    params.UserData = userData;
  }

  console.log('EC2 runInstances params:', params); // Log the EC2 runInstances params

  // Cria a instância EC2
  const data = await ec2.runInstances(params).promise();
  return data.Instances;
}

module.exports = createEc2;