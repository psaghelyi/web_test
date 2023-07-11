import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { locustImage } from './docker-images';
import { allPorts } from './allPorts';


export function createLocustService(stack: cdk.Stack, cluster: ecs.Cluster) : ecs.FargateService {

  // Define the Locust Task Definitions
  const locustWorkerTaskDefinition = new ecs.FargateTaskDefinition(stack, 'LocustWorkerTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  locustWorkerTaskDefinition.addContainer('LocustWorkerContainer', {
    image: locustImage,
    command: ['-f', '/locust/locustfile.py', '--worker', '--master-host', 'locust.local'],
    environment: {
      'LOGGER_LEVEL': 'DEBUG',
      'RELAY_URL': 'http://echo.local:8080',
    },
    logging: new ecs.AwsLogDriver({ streamPrefix: 'locust-worker', mode: ecs.AwsLogDriverMode.NON_BLOCKING }),  // Optional
  });


  const locustMasterTaskDefinition = new ecs.FargateTaskDefinition(stack, 'LocustMasterTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  locustMasterTaskDefinition.addContainer('LocustMasterContainer', {
    image: locustImage,
    command: ['-f', '/locust/locustfile.py', '--master', '--host', 'http://web.local:8000'],
    environment: {
      'LOGGER_LEVEL': 'DEBUG',
      'INFLUXDB_PATH': 'http://influxdb.local:8086',
    },
    portMappings: [{ containerPort: 8089 }],
    logging: new ecs.AwsLogDriver({ streamPrefix: 'locust-master', mode: ecs.AwsLogDriverMode.NON_BLOCKING }),  // Optional
  });


  // locust worker need no inbound network connection so it does not need any loadbalancer
  const locustWorkerService = new ecs.FargateService(stack, 'LocustWorkerService', {
    cluster,
    taskDefinition: locustWorkerTaskDefinition,
    desiredCount: 3,
  });

  // locust master should be available from outside using http
  const locustMaterService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'LocustMasterService', {
    cluster,
    taskDefinition: locustMasterTaskDefinition,
    desiredCount: 1,
    cloudMapOptions: {
      name: 'locust',
    },
    publicLoadBalancer: true,
    listenerPort: 8089,
  });
  
  locustMaterService.service.connections.allowFromAnyIpv4(allPorts);

  return locustWorkerService;
}
