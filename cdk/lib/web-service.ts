import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { webImage, proxyImage } from './docker-images';
import { allPorts } from './allPorts';


export function createWebService(stack: cdk.Stack, cluster: ecs.Cluster) : ecs.FargateService {

  const webTaskDefinition = new ecs.FargateTaskDefinition(stack, 'WebTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  webTaskDefinition.addContainer('ProxyContainer', {
    image: proxyImage,
    portMappings: [{ containerPort: 8000 }],
    logging: new ecs.AwsLogDriver({ streamPrefix: 'proxy', mode: ecs.AwsLogDriverMode.NON_BLOCKING }),  // Optional
  });

  webTaskDefinition.addContainer('WebContainer', {
    image: webImage,
    portMappings: [{ containerPort: 8080 }],
    logging: new ecs.AwsLogDriver({ streamPrefix: 'web', mode: ecs.AwsLogDriverMode.NON_BLOCKING }),  // Optional
    environment: {
      'WORKERS': '5',
    },
  });

  const webService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'WebService', {
    cluster,
    taskDefinition: webTaskDefinition,
    desiredCount: 6,
    cloudMapOptions: {
      name: 'web',
    },
    publicLoadBalancer: true,
    listenerPort: 80,
    enableExecuteCommand: true,
  });

  webService.service.connections.allowFromAnyIpv4(allPorts);

  return webService.service;
}
