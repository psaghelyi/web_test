import { locustImage } from './docker-images';

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';


export function createLocustService(stack: cdk.Stack, cluster: ecs.Cluster) : void {

  // Define the Locust Task Definitions
  const locustWorkerTaskDefinition = new ecs.FargateTaskDefinition(stack, 'LocustWorkerTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  locustWorkerTaskDefinition.addContainer('LocustWorkerContainer', {
    image: locustImage,
    command: ['locust', '-f', '/locust/locustfile.py', '--worker', '--master-host', 'locust.local'],
  });


  const locustMasterTaskDefinition = new ecs.FargateTaskDefinition(stack, 'LocustMasterTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  locustMasterTaskDefinition.addContainer('LocustMasterContainer', {
    image: locustImage,
    command: ['locust', '--master', '--host', 'http://web.local:8000'],
    portMappings: [{ containerPort: 8089 }],
    logging: new ecs.AwsLogDriver({ streamPrefix: 'locust' }),  // Optional
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
  });
  
  const allPorts = new ec2.Port({
    protocol: ec2.Protocol.TCP,
    fromPort: 0,
    toPort: 65535,
    stringRepresentation: 'All'
  })

  locustMaterService.service.connections.allowFromAnyIpv4(allPorts);

}
