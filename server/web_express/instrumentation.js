const process = require('process');
const opentelemetry = require("@opentelemetry/sdk-node");

const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { PeriodicExportingMetricReader, ConsoleMetricExporter } = require("@opentelemetry/sdk-metrics");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-grpc");
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { AWSXRayPropagator } = require("@opentelemetry/propagator-aws-xray");
const { AWSXRayIdGenerator } = require("@opentelemetry/id-generator-aws-xray");
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');


const _resource = Resource.default().merge(new Resource({
  //[SemanticResourceAttributes.SERVICE_NAME]: "js-sample-app",
}));

//const _traceExporter = new ConsoleSpanExporter();
const _traceExporter = new OTLPTraceExporter();

const _spanProcessor = new BatchSpanProcessor(_traceExporter);

const _tracerConfig = {
  idGenerator: new AWSXRayIdGenerator(),
}
const _metricReader = new PeriodicExportingMetricReader({
  //exporter: new ConsoleMetricExporter(),
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 1000
});


const sdk = new opentelemetry.NodeSDK({
  textMapPropagator: new AWSXRayPropagator(),
  metricReader: _metricReader,
  instrumentations: [
    // collects all the necessary instrumentation libraries, 
    // so that you do not have to create a list by hand
    new getNodeAutoInstrumentations(),
  ],
  resource: _resource,
  spanProcessor: _spanProcessor,
  traceExporter: _traceExporter,
});
sdk.configureTracerProvider(_tracerConfig, _spanProcessor);

// this enables the API to record telemetry
sdk.start();

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing and Metrics terminated'))
    .catch((error) => console.log('Error terminating tracing and metrics', error))
    .finally(() => process.exit(0));
});
