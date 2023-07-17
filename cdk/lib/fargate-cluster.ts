import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

import { createEchoService } from './echo-service';
import { createWebService } from './web-service';
import { createInfluxdbService } from './influxdb-service';
import { createLocustService } from './locust-service';

export class FargateClusterStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps ) {
    super(scope, id, props);

    // Create a VPC for the Fargate cluster
    const vpc = new ec2.Vpc(this, 'WebtestVpc', {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a new ECS cluster
    const cluster = new ecs.Cluster(this, 'WebtestCluster', {
      vpc,
      containerInsights: true,
      defaultCloudMapNamespace: { name: 'local' }
    });

    // Create log group with retention
    const logGroup = new logs.LogGroup(this, 'WebTestLogGroup', {
      logGroupName: '/ecs/web-test',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });
  
    // Create services
    const echoService = createEchoService(this, cluster, logGroup);
    const webService = createWebService(this, cluster, logGroup);
    const influxdbService = createInfluxdbService(this, cluster, logGroup);
    const locustService = createLocustService(this, cluster, logGroup);

    // Set service creation order
    webService.node.addDependency(echoService);
    locustService.node.addDependency(influxdbService);

  }
}
