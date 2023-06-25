
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
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
    });
    cluster.addDefaultCloudMapNamespace({ name: 'local' });


    createEchoService(this, cluster);
    createWebService(this, cluster);
    createInfluxdbService(this, cluster);
    //createLocustService(this, cluster);
    

    
    


  }
}
