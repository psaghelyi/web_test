import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { allPorts } from './allPorts';


export function createInfluxdbService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup) : ecs.FargateService {

  const influxdbTaskDefinition = new ecs.FargateTaskDefinition(stack, 'InfluxdbTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  influxdbTaskDefinition.addContainer('InfluxdbContainer', {
    image: ecs.ContainerImage.fromRegistry('influxdb:latest'),
    portMappings: [{ containerPort: 8086 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'influxdb', 
      mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
  });

  const influxdbService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'InfluxdbService', {
    cluster,
    taskDefinition: influxdbTaskDefinition,
    desiredCount: 1,
    cloudMapOptions: {
      name: 'influxdb',
    },
    publicLoadBalancer: true,
    listenerPort: 8086,
  });

  influxdbService.service.connections.allowFromAnyIpv4(allPorts);

  return influxdbService.service;
}
