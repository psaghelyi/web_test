import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';


export class WebLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const region = cdk.Stack.of(this).region;
        
        // Using the OTEL Collector layer
        //const otelCollectorLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'OTelCollectorLayer', `arn:aws:lambda:${region}:184161586896:layer:opentelemetry-collector-amd64-0_2_0:1`);

        // Using the OTEL layer
        const otelSdkLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'OTellayer', `arn:aws:lambda:${region}:184161586896:layer:opentelemetry-nodejs-0_2_0:1`);
        
        // Create an AWS Lambda function
        const handler = new lambda.Function(this, 'WebHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            handler: 'dist/index.handler',
            tracing: lambda.Tracing.ACTIVE,
            code: lambda.Code.fromAsset('../server/web_lambda'),
            layers: [otelSdkLayer],
            environment: {
                AWS_LAMBDA_EXEC_WRAPPER: "/opt/otel-handler",
                OTEL_LOG_LEVEL: "debug",
            },
            logRetention: logs.RetentionDays.ONE_DAY,
        });

        // Grant permissions to publish traces to X-Ray
        handler.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords",
                "xray:GetSamplingRules",
                "xray:GetSamplingTargets",
                "xray:GetSamplingStatisticSummaries"
            ],
            resources: ["*"]
        }));

        // Grant permissions to create and write to CloudWatch Logs streams
        handler.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "logs:PutLogEvents",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogStreams",
                "logs:DescribeLogGroups",
                "cloudwatch:PutMetricData"],
              resources: ["*"],
        }));

        const api = new apigateway.LambdaRestApi(this, "web-api", {
            handler: handler,
            restApiName: "Web Service",
            description: "This is WebService.",
            deployOptions: {
                tracingEnabled: true,
            },
        });
    }
}
