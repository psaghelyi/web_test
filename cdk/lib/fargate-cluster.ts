
import { Stack, StackProps } from 'aws-cdk-lib';
import { locustImage, webImage, echoImage } from './docker-images';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

export class FargateClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    // Import an existing VPC by querying the AWS environment this stack is deployed to
    const vpc = Vpc.fromLookup(this, 'Vpc', {
        vpcId: 'vpc-0d71d7e74b3661b34',
      });

    // Create a new ECS cluster
    const cluster = new Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    // Define our Task Definitions
    const locustTaskDefinition = new FargateTaskDefinition(this, 'LocustTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    locustTaskDefinition.addContainer('LocustContainer', {
      
      image: locustImage,
      command: ['locust', '-f', '/mnt/locustfile.py', '--host', 'http://web'],
    });

    const webTaskDefinition = new FargateTaskDefinition(this, 'WebTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    webTaskDefinition.addContainer('WebContainer', {
      image: webImage,
      command: ['gunicorn', '-w', '4', '-b', '0.0.0.0:80', 'app:app'],
    });

    webTaskDefinition.addContainer('NginxContainer', {
      image: ContainerImage.fromRegistry('nginx'),
      portMappings: [{ containerPort: 80 }],
    });

    const echoTaskDefinition = new FargateTaskDefinition(this, 'EchoTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    echoTaskDefinition.addContainer('EchoContainer', {
      image: echoImage,
    });

    // Create an ECS Service for each Task Definition
    new ApplicationLoadBalancedFargateService(this, 'LocustService', {
      cluster,
      taskDefinition: locustTaskDefinition,
      desiredCount: 4,
      publicLoadBalancer: true,
    });

    new ApplicationLoadBalancedFargateService(this, 'WebService', {
      cluster,
      taskDefinition: webTaskDefinition,
      desiredCount: 8,
      publicLoadBalancer: true,
    });

    new ApplicationLoadBalancedFargateService(this, 'EchoService', {
      cluster,
      taskDefinition: echoTaskDefinition,
      desiredCount: 1,
      publicLoadBalancer: true,
    });
  }
}
