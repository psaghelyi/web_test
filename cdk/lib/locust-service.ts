import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

import { locustImage } from './docker-images';
import { allPorts } from './all-ports';


export function createLocustService(stack: cdk.Stack, cluster: ecs.Cluster, logGroup: logs.LogGroup): ecs.FargateService {

  const locustWorkerTaskDefinition = new ecs.FargateTaskDefinition(stack, 'LocustWorkerTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  locustWorkerTaskDefinition.addContainer('LocustWorkerContainer', {
    image: locustImage,
    command: ['-f', '/locust/locustfile.py', '--worker', '--master-host', 'locust.local'],
    environment: {
      'LOGGER_LEVEL': 'DEBUG',
      'RELAY_URL': encodeURIComponent('http://echo.local:8080/waitrnd?ms=200') + '&repeat=5',
    },
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'locust-worker',
      mode: ecs.AwsLogDriverMode.NON_BLOCKING
    }),
  });


  const locustMasterTaskDefinition = new ecs.FargateTaskDefinition(stack, 'LocustMasterTaskDefinition', {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  let webService = stack.node.tryFindChild('WebService') as ecs_patterns.ApplicationLoadBalancedServiceBase | undefined;
  if (!webService) {
    console.log('WebService not found. Exiting.');
    process.exit(1);
  }
  let webServiceDnsName = webService.loadBalancer.loadBalancerDnsName;

  locustMasterTaskDefinition.addContainer('LocustMasterContainer', {
    image: locustImage,
    command: ['-f', '/locust/locustfile.py', '--master', '--host', `http://${webServiceDnsName}`],
    environment: {
      'LOGGER_LEVEL': 'DEBUG',
      'INFLUXDB_PATH': 'http://influxdb.local:8086',
    },
    portMappings: [{ containerPort: 8089 }],
    logging: new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: 'locust-master',
      mode: ecs.AwsLogDriverMode.NON_BLOCKING
    }),
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
