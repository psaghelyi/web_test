import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { echoImage } from './docker-images';
import { allPorts } from './allPorts';


export function createEchoService(stack: cdk.Stack, cluster: ecs.Cluster) : ecs.FargateService {

  const echoTaskDefinition = new ecs.FargateTaskDefinition(stack, 'EchoTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  echoTaskDefinition.addContainer('EchoContainer', {
    image: echoImage,
    portMappings: [{ containerPort: 8080 }],
    logging: new ecs.AwsLogDriver({ streamPrefix: 'echo' }),  // Optional
    //healthCheck: {
    //  command: [
    //    'CMD-SHELL',
    //    'curl -f http://localhost:8080/ || exit 1',
    //  ],
    //  interval: cdk.Duration.seconds(30),
    //  timeout: cdk.Duration.seconds(5),
    //  startPeriod: cdk.Duration.seconds(60),
    //  retries: 3,
    //},
  });

  const echoService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'EchoService', {
    cluster,
    taskDefinition: echoTaskDefinition,
    desiredCount: 3,
    cloudMapOptions: {
      name: 'echo',
      containerPort: 8080,
    },
    publicLoadBalancer: true,
    listenerPort: 8080,
  });

  echoService.service.connections.allowFromAnyIpv4(allPorts);

  return echoService.service;
}
