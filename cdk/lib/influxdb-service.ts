import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { allPorts } from './allPorts';


export function createInfluxdbService(stack: cdk.Stack, cluster: ecs.Cluster) : ecs.FargateService {

  const influxdbTaskDefinition = new ecs.FargateTaskDefinition(stack, 'InfluxdbTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  influxdbTaskDefinition.addContainer('InfluxdbContainer', {
    image: ecs.ContainerImage.fromRegistry('influxdb:latest'),
    logging: new ecs.AwsLogDriver({ streamPrefix: 'InfluxDb' }),  // Optional
    portMappings: [{ containerPort: 8086 }],
  });

  const influxdbService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'InfluxdbService', {
    cluster,
    taskDefinition: influxdbTaskDefinition,
    desiredCount: 1,
    cloudMapOptions: {
      name: 'influxdb',
      containerPort: 8086,
    },
    publicLoadBalancer: true,
    listenerPort: 8086,
  });

  influxdbService.service.connections.allowFromAnyIpv4(allPorts);

  return influxdbService.service;
}
