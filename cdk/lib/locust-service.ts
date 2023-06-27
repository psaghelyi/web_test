import { locustImage } from './docker-images';

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';


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
      'INFLUXDB_PATH': 'http://influxdb.local:8086',
    },
    logging: new ecs.AwsLogDriver({ streamPrefix: 'locust-worker' }),  // Optional
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
    logging: new ecs.AwsLogDriver({ streamPrefix: 'locust-master' }),  // Optional
  });


  // locust worker need no inbound network connection so it does not need any loadbalancer
  const locustWorkerService = new ecs.FargateService(stack, 'LocustWorkerService', {
    cluster,
    taskDefinition: locustWorkerTaskDefinition,
    desiredCount: 4,
  });

  // locust master should be available from outside using http
  const locustMaterService = new ecs_patterns.NetworkLoadBalancedFargateService(stack, 'LocustMasterService', {
    cluster,
    taskDefinition: locustMasterTaskDefinition,
    desiredCount: 1,
    cloudMapOptions: {
      name: 'locust',
      containerPort: 8089,
    },
    publicLoadBalancer: true,
    listenerPort: 8089,
  });
  
  const allPorts = new ec2.Port({
    protocol: ec2.Protocol.TCP,
    fromPort: 0,
    toPort: 65535,
    stringRepresentation: 'All'
  })

  locustMaterService.service.connections.allowFromAnyIpv4(allPorts);

  locustWorkerService.node.addDependency(locustMaterService.service);

  return locustWorkerService;
}
