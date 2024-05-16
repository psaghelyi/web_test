import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { webImage, proxyImage } from './docker-images';
import { allPorts } from './all-ports';
import { FargateWithOtelCollectorTaskDefinition } from './fargate-with-otel-collector-task-definition';

export function createWebService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup, swParam: ssm.StringParameter) : ecs.FargateService {

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
      'OTEL_RESOURCE_ATTRIBUTES': 'aws.log.group.names=' + logGroup.logGroupName,
    },
  });

  //const containerOtelCollector = webTaskDefinition.addOtelCollectorContainer(logGroup);
  const containerCloudWatchAgent = webTaskDefinition.addCloudWatchAgentContainer(logGroup, swParam);
  //const containerXRaysidecar = webTaskDefinition.addXRaysidecarContainer(logGroup);

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
