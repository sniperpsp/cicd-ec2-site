document.addEventListener('DOMContentLoaded', function() {
  const credentialsForm = document.getElementById('credentialsForm');
  const servicesForm = document.getElementById('servicesForm');
  const destroyForm = document.getElementById('destroyForm');
  const optionsDiv = document.getElementById('options');
  const createButton = document.getElementById('createButton');
  const destroyButton = document.getElementById('destroyButton');
  const rootBlockDeviceCheckbox = document.getElementById('rootBlockDeviceCheckbox');
  const rootBlockDeviceOptions = document.getElementById('rootBlockDeviceOptions');
  const subnetSecurityGroupOptions = document.getElementById('subnetSecurityGroupOptions');
  const vpcCheckbox = document.getElementById('vpcCheckbox');
  const ec2Checkbox = document.getElementById('ec2Checkbox');
  const backButton = document.getElementById('backButton');

  if (backButton) {
    backButton.addEventListener('click', function() {
      window.history.back();
    });
  }

  if (credentialsForm) {
    credentialsForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const accessKeyId = document.getElementById('accessKeyId').value;
      const secretAccessKey = document.getElementById('secretAccessKey').value;
      const region = document.getElementById('region').value;

      // Não armazenar credenciais no localStorage
      // localStorage.setItem('accessKeyId', accessKeyId);
      // localStorage.setItem('secretAccessKey', secretAccessKey);
      // localStorage.setItem('region', region);

      // Redirecionar para a página de opções
      window.location.href = 'options.html';
    });
  }

  if (createButton) {
    createButton.addEventListener('click', function() {
      window.location.href = 'create.html';
    });
  }

  if (destroyButton) {
    destroyButton.addEventListener('click', function() {
      window.location.href = 'destroy.html';
    });
  }

  if (servicesForm) {
    vpcCheckbox.addEventListener('change', function() {
      if (this.checked) {
        subnetSecurityGroupOptions.style.display = 'none';
      } else {
        subnetSecurityGroupOptions.style.display = 'block';
      }
    });

    ec2Checkbox.addEventListener('change', function() {
      const ec2Options = document.getElementById('ec2Options');
      if (this.checked) {
        ec2Options.style.display = 'block';
      } else {
        ec2Options.style.display = 'none';
      }
    });

    rootBlockDeviceCheckbox.addEventListener('change', function() {
      if (this.checked) {
        rootBlockDeviceOptions.style.display = 'block';
      } else {
        rootBlockDeviceOptions.style.display = 'none';
      }
    });

    servicesForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const components = Array.from(document.querySelectorAll('input[name="components"]:checked')).map(el => el.value);
      let ami = document.getElementById('ami').value;
      const instanceType = document.getElementById('instanceType').value;
      const associatePublicIp = document.getElementById('associatePublicIp').checked;
      const disableApiTermination = document.getElementById('disableApiTermination').checked;
      const subnetId = document.getElementById('subnetId').value;
      const securityGroups = document.getElementById('securityGroups').value;
      const userData = document.getElementById('userData').value;
      const iamInstanceProfile = document.getElementById('iamInstanceProfile').value;

      const rootBlockDevice = rootBlockDeviceCheckbox.checked ? {
        volumeType: document.getElementById('volumeType').value,
        volumeSize: document.getElementById('volumeSize').value
      } : null;

      const accessKeyId = localStorage.getItem('accessKeyId');
      const secretAccessKey = localStorage.getItem('secretAccessKey');
      const region = localStorage.getItem('region');

      const createVpc = components.includes('vpc');
      const createEc2 = components.includes('ec2');

      // Definir valor padrão para AMI se não for informado
      if (!ami) {
        ami = 'ami-0b72821e2f351e396';
      }

      const tags = [
        { key: 'Name', value: 'MyEC2Instance' },
        { key: 'App', value: 'MyApp' },
        { key: 'Servico', value: 'MyService' }
      ];

      const ec2Params = {
        ami,
        instanceType,
        associatePublicIp,
        disableApiTermination,
        subnetId: createVpc ? null : subnetId,
        securityGroups: createVpc ? null : securityGroups,
        userData,
        iamInstanceProfile,
        rootBlockDevice,
        tags
      };

      // Monta o comando AWS CLI
      let cliCommand = `aws ec2 run-instances --image-id ${ami} --count 1 --instance-type ${instanceType} --key-name keylinux`;
      if (securityGroups) cliCommand += ` --security-group-ids ${securityGroups}`;
      if (subnetId) cliCommand += ` --subnet-id ${subnetId}`;
      if (associatePublicIp) cliCommand += ` --associate-public-ip-address`;
      if (disableApiTermination) cliCommand += ` --disable-api-termination`;
      if (iamInstanceProfile) cliCommand += ` --iam-instance-profile Name=${iamInstanceProfile}`;
      if (rootBlockDevice) {
        cliCommand += ` --block-device-mappings DeviceName=/dev/sda1,Ebs={VolumeType=${rootBlockDevice.volumeType},VolumeSize=${rootBlockDevice.volumeSize}}`;
      }
      if (userData) cliCommand += ` --user-data ${userData}`;
      cliCommand += ` --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MyEC2Instance},{Key=App,Value=MyApp},{Key=Servico,Value=MyService}]'`;

      console.log('AWS CLI Command:', cliCommand);

      fetch('/create-aws-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessKeyId, secretAccessKey, region, createVpc, createEc2, ec2Params })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const output = document.getElementById('output');
        if (data.error) {
          output.textContent = 'Error: ' + data.error;
        } else {
          output.textContent = createEc2 ? 'EC2 Instance Created: ' + JSON.stringify(data.instances, null, 2) : 'VPC and dependencies created successfully';
        }
      })
      .catch(error => {
        const output = document.getElementById('output');
        output.textContent = 'Error: ' + error.message;
        console.error('Error:', error);
      });
    });
  }

  if (destroyForm) {
    destroyForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const vpcId = document.getElementById('vpcId').value;
      const instanceId = document.getElementById('instanceId').value;

      const accessKeyId = localStorage.getItem('accessKeyId');
      const secretAccessKey = localStorage.getItem('secretAccessKey');
      const region = localStorage.getItem('region');

      fetch('/destroy-aws-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessKeyId, secretAccessKey, region, vpcId, instanceId })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const output = document.getElementById('destroyOutput');
        if (data.error) {
          output.textContent += 'Error: ' + data.error + '\n';
        } else {
          output.textContent += data.message + '\n';
        }
      })
      .catch(error => {
        const output = document.getElementById('destroyOutput');
        output.textContent += 'Error: ' + error.message + '\n';
        console.error('Error:', error);
      });
    });
  }
});