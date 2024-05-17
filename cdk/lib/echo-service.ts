import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { echoImage, echoOtelImage } from './docker-images';
import { allPorts } from './all-ports';
import { addEcsRole } from './add-ecs-role'
import { FargateWithOtelCollectorTaskDefinition } from './fargate-with-otel-collector-task-definition';


// ECHO SERVICE
export function createEchoService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup, swParam: ssm.StringParameter) : ecs.FargateService {

  const echoTaskDefinition = new FargateWithOtelCollectorTaskDefinition(stack, 'EchoTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
    executionRole: addEcsRole(stack, 'addEcsEchoRole')
  });

  const containerEcho = echoTaskDefinition.addContainer('EchoContainer', {
    image: echoImage,
    portMappings: [{ containerPort: 8080 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'echo', 
      mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
    environment: {
      'WORKERS': '5',
      'AWS_XRAY_TRACING_NAME': 'web-service',
      // 'OTEL_RESOURCE_ATTRIBUTES': 'aws.log.group.names=' + logGroup.logGroupName,
    },
  });

  //const containerOtelCollector = echoTaskDefinition.addOtelCollectorContainer(logGroup);
  const containerCloudWatchAgent = echoTaskDefinition.addCloudWatchAgentContainer(logGroup, swParam);
  //const containerXRaysidecar = echoTaskDefinition.addXRaysidecarContainer(logGroup);


  const echoService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'EchoService', {
    cluster,
    taskDefinition: echoTaskDefinition,
    desiredCount: 3,
    cloudMapOptions: {
      name: 'echo',
    },
    publicLoadBalancer: true,
    listenerPort: 8080,
  });

  echoService.service.connections.allowFromAnyIpv4(allPorts);

  return echoService.service;
}


// ECHO OTEL SERVICE

export function createEchoOtelService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup, swParam: ssm.StringParameter) : ecs.FargateService {
  const echoOtelTaskDefinition = new FargateWithOtelCollectorTaskDefinition(stack, 'EchoOtelTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
    executionRole: addEcsRole(stack, 'addEcsEchoOtelRole')
  });

  const containerOtelEcho = echoOtelTaskDefinition.addContainer('EchoOtelContainer', {
    image: echoOtelImage,
    portMappings: [{ containerPort: 8080 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'echo-otel',
      mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
    environment: {
      'WORKERS': '5',
      'OTEL_SERVICE_NAME': 'echo-service-otel',
      'OTEL_RESOURCE_ATTRIBUTES': 'aws.log.group.names=' + logGroup.logGroupName,
    },
  });

  const containerOtelCloudWatchAgent = echoOtelTaskDefinition.addCloudWatchAgentContainer(logGroup, swParam);

  const echoOtelService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'EchoOtelService', {
    cluster,
    taskDefinition: echoOtelTaskDefinition,
    desiredCount: 3,
    cloudMapOptions: {
      name: 'echo_otel',
    },
    publicLoadBalancer: true,
    listenerPort: 8080,
  });

  echoOtelService.service.connections.allowFromAnyIpv4(allPorts);

  return echoOtelService.service;
}
