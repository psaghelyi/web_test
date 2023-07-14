
```typescript

  const containerOtelCollector = webTaskDefinition.addContainer('OtelCollector', {
    image: ecs.ContainerImage.fromRegistry('bash'),
    command: ['-c', 'cat /etc/otel-collector/config.yaml && sleep 10000'],
    logging: new ecs.AwsLogDriver({ streamPrefix: 'config', mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
  });


  containerOtelCollector.addMountPoints({
    containerPath: '/etc/otel-collector',
    readOnly: true,
    sourceVolume: 'otel-conf-vol',
  });

  const ContainerOtelCollectorConfig = webTaskDefinition.addContainer('OtelCollectorConfig', {
    image: ecs.ContainerImage.fromRegistry('bash'),
    essential: false,
    command: ['-c', 'echo $CONFIG_DATA | base64 -d - | tee /etc/otel-collector/config.yaml'],
    environment: {
      //'AWS_ACCESS_KEY_ID': cdk.SecretValue.secretsManager('AWS_ACCESS_KEY_ID').toString(),
      'CONFIG_DATA': cdk.Fn.base64
      (`
extensions:
  health_check:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch/traces:
    timeout: 1s
    send_batch_size: 50
  resourcedetection:
    detectors:
      - env
      - system
      - ecs
      - ec2

exporters:
  awsxray:

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resourcedetection, batch/traces]
      exporters: [awsxray]

  extensions: [health_check]
      `)
    },
  });
  
  ContainerOtelCollectorConfig.addMountPoints({
    containerPath: '/etc/otel-collector',
    readOnly: false,
    sourceVolume: 'otel-conf-vol',
  });

  // Create config for the OTEL collector first
  containerOtelCollector.addContainerDependencies({
    container: ContainerOtelCollectorConfig,
    condition: ecs.ContainerDependencyCondition.COMPLETE,
  });

```
