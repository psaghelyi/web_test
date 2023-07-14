import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { webImage, proxyImage } from './docker-images';
import { allPorts } from './allPorts';


export function createWebService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup) : ecs.FargateService {

  const webTaskDefinition = new ecs.FargateTaskDefinition(stack, 'WebTaskDefinition', {
    memoryLimitMiB: 1024,
    cpu: 512,
  });

  // Enable AWS X-Ray tracing for the service's task definition
  webTaskDefinition.addToTaskRolePolicy(new iam.PolicyStatement({
    actions: [
      'xray:PutTraceSegments',
      'xray:PutTelemetryRecords',
      'xray:GetSamplingRules',
      'xray:GetSamplingTargets',
      'xray:GetSamplingStatisticSummaries'],
    resources: ['*'],
  }));

  // Enable AWS Cloudwatch Logs for the service's task definition
  webTaskDefinition.addToTaskRolePolicy(new iam.PolicyStatement({
    actions: [
      'logs:PutLogEvents',
      'logs:CreateLogGroup',
      'logs:CreateLogStream',
      'logs:DescribeLogStreams',
      'logs:DescribeLogGroups',
      'cloudwatch:PutMetricData'],
    resources: ['*'],
  }));
  
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
    },
  });

  
  const containerOtelCollector = webTaskDefinition.addContainer('OtelCollector', {
    image: ecs.ContainerImage.fromRegistry('public.ecr.aws/aws-observability/aws-otel-collector:latest'),
    command: ['--config=/etc/ecs/ecs-cloudwatch-xray.yaml'], // this file is in the OTEL collector image
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'ecs', 
      mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
  });
  

  


  // Then start the OTEL collector before the others
  containerWeb.addContainerDependencies({
    container: containerOtelCollector,
    condition: ecs.ContainerDependencyCondition.START,
  });

  containerProxy.addContainerDependencies({
    container: containerOtelCollector,
    condition: ecs.ContainerDependencyCondition.START,
  });
  

  const webService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'WebService', {
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
