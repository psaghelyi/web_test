import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

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
  
  public addOtelCollectorContainer(logGroup?: logs.LogGroup): ecs.ContainerDefinition {
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

}
