import * as ec2 from 'aws-cdk-lib/aws-ec2';

export const allPorts = new ec2.Port({
  protocol: ec2.Protocol.TCP,
  fromPort: 0,
  toPort: 65535,
  stringRepresentation: 'All'
});
