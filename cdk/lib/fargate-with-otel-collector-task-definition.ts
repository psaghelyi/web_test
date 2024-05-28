import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface FargateWithOtelCollectorTaskDefinitionProps extends ecs.FargateTaskDefinitionProps {
  readonly logStreamPreix?: string;
}

export class FargateWithOtelCollectorTaskDefinition
  extends ecs.FargateTaskDefinition {
  constructor(scope: Construct, id: string, props?: FargateWithOtelCollectorTaskDefinitionProps) {
    super(scope, id, props);

    this.addMonitoringPolicies();
  }

  private addMonitoringPolicies(): void {
    // Enable AWS X-Ray tracing for the service's task definition
    this.addToTaskRolePolicy(new iam.PolicyStatement({
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords',
        'xray:GetSamplingRules',
        'xray:GetSamplingTargets',
        'xray:GetSamplingStatisticSummaries'],
      resources: ['*'],
    }));

    // Enable AWS Cloudwatch Logs for the service's task definition
    this.addToTaskRolePolicy(new iam.PolicyStatement({
      actions: [
        'logs:PutLogEvents',
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:DescribeLogStreams',
        'logs:DescribeLogGroups',
        'cloudwatch:PutMetricData'],
      resources: ['*'],
    }));
  }
  
  public addOtelCollectorContainer(logGroup: logs.LogGroup): ecs.ContainerDefinition {
    const containerOtelCollector = this.addContainer('OtelCollector', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/aws-observability/aws-otel-collector:latest'),
      command: ['--config=/etc/ecs/ecs-cloudwatch-xray.yaml'], // this file is in the OTEL collector image
      logging: new ecs.AwsLogDriver({
        logGroup: logGroup,
        streamPrefix: 'otel',
        mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
      essential: false,
    });
    return containerOtelCollector;
  }

  // add CloudWatch side car container
  public addCloudWatchAgentContainer(logGroup: logs.LogGroup, swParam: ssm.StringParameter): ecs.ContainerDefinition {
    // const port = '2802'
    // const xrayDaemonAddress = `xray-daemon:${port}`
    const containerCloudWatch = this.addContainer('CloudWatchAgent', {
      image: ecs.ContainerImage.fromRegistry('amazon/cloudwatch-agent:latest'),
      logging: new ecs.AwsLogDriver({
        logGroup: logGroup,
        streamPrefix: 'cloudwatch',
        mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
      essential: false,
      // environment: {
      //   // 4
      //   'AWS_XRAY_DAEMON_ADDRESS': xrayDaemonAddress,
      // },
      secrets: {
        "CW_CONFIG_CONTENT": ecs.Secret.fromSsmParameter(swParam),
      },
    });
    return containerCloudWatch;
  }

  // add XRay side car container
  public addXRaysidecarContainer(logGroup: logs.LogGroup): ecs.ContainerDefinition {
    const port = '2802'
    const bindAddress = `0.0.0.0:${port}`
    const xrayDaemonAddress = `xray-daemon:${port}`
    const containerXRay = this.addContainer('XRay', {
      image: ecs.ContainerImage.fromRegistry('amazon/aws-xray-daemon:latest'),
      containerName: 'xray-daemon',
      logging: new ecs.AwsLogDriver({
        logGroup: logGroup,
        streamPrefix: 'xray-daemon',
        mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
      essential: false,
      environment: {
        AWS_XRAY_DAEMON_ADDRESS: xrayDaemonAddress,
        AWS_XRAY_CONTEXT_MISSING: 'LOG_ERROR'
      },
      entryPoint: ["/xray", "-t", bindAddress, "-b", bindAddress],
    });
    return containerXRay;
  }

}
