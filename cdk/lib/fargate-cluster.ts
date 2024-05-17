import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { createEchoService, createEchoOtelService } from './echo-service';
import { createWebService, createOtelWebService } from './web-service';

export class FargateClusterStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps ) {
    super(scope, id, props);

    // Create a VPC for the Fargate cluster
    const vpc = new ec2.Vpc(this, 'WebtestVpc', {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a VPC for the OtelFargate cluster
    const otelVpc = new ec2.Vpc(this, 'OtelWebtestVpc', {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a new ECS cluster
    const cluster = new ecs.Cluster(this, 'WebtestCluster', {
      vpc,
      containerInsights: true,
      defaultCloudMapNamespace: { name: 'local' }
    });

    const otelCluster = new ecs.Cluster(this, 'WebtestOtelCluster', {
      vpc: otelVpc,
      containerInsights: true,
      defaultCloudMapNamespace: { name: 'local' }
    });

    // Create log group with retention
    const logGroup = new logs.LogGroup(this, 'WebTestLogGroup', {
      logGroupName: '/ecs/web-test',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });

    // Create log group with retention
    const logGroupOtel = new logs.LogGroup(this, 'WebTestOtelLogGroup', {
      logGroupName: '/ecs/web-test-otel',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });

    const cwParam = new ssm.StringParameter(this, 'CloudWatchConfigStringParameter', {
      description: 'Parameter for CloudWatch agent',
      parameterName: 'CloudWatchConfig',
      stringValue: JSON.stringify(
        {
          "metrics": {
            "namespace": "OpenTuna",
            "metrics_collected": {
              "cpu": {
                "measurement": ["usage_idle", "usage_iowait", "usage_system", "usage_user"],
              },
              "net": {
                "measurement": ["bytes_sent", "bytes_recv", "packets_sent", "packets_recv"],
              },
              "netstat": {
                "measurement": ["tcp_established", "tcp_syn_sent", "tcp_close"],
              }
            }
          },
          "logs": {
            "metrics_collected": {
              "emf": {}
            }
          },
          "traces": {
            "traces_collected": {
              "xray": {
              },
              "otlp": {
              }
            }
          }              
        }
      ),
    });
  
    // Create services
    const echoService = createEchoService(this, cluster, logGroup, cwParam);
    const echoOtelService = createEchoOtelService(this, otelCluster, logGroupOtel, cwParam);
    const webService = createWebService(this, cluster, logGroup, cwParam);
    const webOtelService = createOtelWebService(this, otelCluster, logGroupOtel, cwParam);

    //const influxdbService = createInfluxdbService(this, cluster, logGroup);
    //const locustService = createLocustService(this, cluster, logGroup);

    // Set service creation order
    //webService.node.addDependency(echoService);
    //locustService.node.addDependency(influxdbService);

  }
}
