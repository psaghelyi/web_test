import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import { locustImage, webImage, echoImage } from './docker-images';

export class FargateClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import an existing VPC by querying the AWS environment this stack is deployed to
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
        vpcId: 'vpc-0d71d7e74b3661b34',
      });

    // Create a new ECS cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    // Define our Task Definitions
    const locustTaskDefinition = new ecs.FargateTaskDefinition(this, 'LocustTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    locustTaskDefinition.addContainer('LocustContainer', {
      image: locustImage,
      command: ['locust', '-f', '/mnt/locustfile.py', '--host', 'http://web'],
    });

    const webTaskDefinition = new ecs.FargateTaskDefinition(this, 'WebTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    webTaskDefinition.addContainer('WebContainer', {
      image: webImage,
      command: ['gunicorn', '-w', '4', '-b', '0.0.0.0:80', 'app:app'],
    });

    webTaskDefinition.addContainer('NginxContainer', {
      image: ecs.ContainerImage.fromRegistry('nginx'),
      portMappings: [{ containerPort: 80 }],
    });

    const echoTaskDefinition = new ecs.FargateTaskDefinition(this, 'EchoTaskDefinition', {
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
