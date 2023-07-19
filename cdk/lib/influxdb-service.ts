import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { allPorts } from './allPorts';


export function createInfluxdbService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup): ecs.FargateService {

  const influxdbTaskDefinition = new ecs.FargateTaskDefinition(stack, 'InfluxdbTaskDefinition', {
    memoryLimitMiB: 1024,
    cpu: 512,
  });

  const containerInfluxdb = influxdbTaskDefinition.addContainer('InfluxdbContainer', {
    image: ecs.ContainerImage.fromRegistry('influxdb:latest'),
    portMappings: [{ containerPort: 8086 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'influxdb',
      mode: ecs.AwsLogDriverMode.NON_BLOCKING
    }),
  });

  const containerInitializer = influxdbTaskDefinition.addContainer('InitilizerContainer', {
    image: ecs.ContainerImage.fromRegistry('influxdb:latest'),
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'influxdb-initializer',
      mode: ecs.AwsLogDriverMode.NON_BLOCKING
    }),
    essential: false,
    command: ['/bin/bash', '-c',
      'until [[ "$(curl -s -o /dev/null -w \"%{http_code}\" http://127.0.0.1:8086/ping)" == "204" ]]; ' + 
      'do echo "ping" && sleep 1; done; echo "ready!" && sleep 5 && ' + 
      'influx setup ' +
        '--host http://127.0.0.1:8086 ' +
        '--org InfluxData ' +
        '--bucket webtest ' +
        '--password root1234 ' +
        '--username root ' +
        '--token secret-token ' +
        '--force'],
  });

  containerInitializer.addContainerDependencies({
    container: containerInfluxdb,
    condition: ecs.ContainerDependencyCondition.START,
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
