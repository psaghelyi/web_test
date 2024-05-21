import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { echoImage, echoImageXray } from './docker-images';
import { allPorts } from './all-ports';
import { addEcsRole } from './add-ecs-role'
import { FargateWithOtelCollectorTaskDefinition } from './fargate-with-otel-collector-task-definition';

// ECHO SERVICE - X-RAY

export function createEchoXrayService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup, swParam: ssm.StringParameter) :  ecs.FargateService {
  const echoTaskDefinitionXray = new FargateWithOtelCollectorTaskDefinition(stack, 'EchoTaskDefinitionXray', {
    memoryLimitMiB: 512,
    cpu: 256,
    executionRole: addEcsRole(stack, 'addEcsEchoRoleXray')
  });

  const containerXrayEcho = echoTaskDefinitionXray.addContainer('EchoXrayContainer', {
    image: echoImageXray,
    portMappings: [{ containerPort: 8080 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'echo-xray',
      mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
    environment: {
      'WORKERS': '5',
      // 'AWS_XRAY_CONTEXT_MISSING': 'LOG_ERROR',
      // 'AWS_XRAY_DAEMON_ADDRESS': 'xray-daemon:2000',
    },
  });

  const containerXrayCloudWatchAgent = echoTaskDefinitionXray.addCloudWatchAgentContainer(logGroup, swParam);
  const containerXRaysidecar = echoTaskDefinitionXray.addXRaysidecarContainer(logGroup);

  const echoServiceXray = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'EchoServiceXray', {
    cluster,
    taskDefinition: echoTaskDefinitionXray,
    desiredCount: 3,
    cloudMapOptions: {
      name: 'echo',
    },
    publicLoadBalancer: true,
    listenerPort: 8080,
  });

  echoServiceXray.service.connections.allowFromAnyIpv4(allPorts);

  return echoServiceXray.service;
}


// ECHO SERVICE - OTEL
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
      // 'AWS_XRAY_TRACING_NAME': 'web-service',
      'OTEL_SERVICE_NAME': 'echo-service',
      'OTEL_RESOURCE_ATTRIBUTES': 'aws.log.group.names=' + logGroup.logGroupName,
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
