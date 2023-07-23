import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { webImage, proxyImage } from './docker-images';
import { allPorts } from './all-ports';
import { FargateWithOtelCollectorTaskDefinition } from './fargate-with-otel-collector-task-definition';

export function createWebService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup) : ecs.FargateService {

  const webTaskDefinition = new FargateWithOtelCollectorTaskDefinition(stack, 'WebTaskDefinition', {
    memoryLimitMiB: 1024,
    cpu: 512,
  });

  const containerProxy = webTaskDefinition.addContainer('ProxyContainer', {
    image: proxyImage,
    portMappings: [{ containerPort: 8000 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'proxy', 
      mode: ecs.AwsLogDriverMode.NON_BLOCKING,
    }),
  });

  const containerWeb = webTaskDefinition.addContainer('WebContainer', {
    image: webImage,
    portMappings: [{ containerPort: 8080 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'web', 
      mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
    environment: {
      'WORKERS': '5',
      'OTEL_SERVICE_NAME': 'web-service',
    },
  });

  const containerOtelCollector = webTaskDefinition.addOtelCollectorContainer(logGroup);

  // Start the OTEL collector before the others
  containerWeb.addContainerDependencies({
    container: containerOtelCollector,
    condition: ecs.ContainerDependencyCondition.START,
  });

  containerProxy.addContainerDependencies({
    container: containerOtelCollector,
    condition: ecs.ContainerDependencyCondition.START,
  });
  

  // Rquests going through through ALB can get xray id in headers
  const webService = new ecs_patterns.ApplicationLoadBalancedFargateService(stack, 'WebService', {
    cluster,
    taskDefinition: webTaskDefinition,
    desiredCount: 3,
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
