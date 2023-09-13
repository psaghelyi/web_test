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
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ExpressLayerType } = require('@opentelemetry/instrumentation-express');


const _resource = Resource.default().merge(new Resource({
  //[SemanticResourceAttributes.SERVICE_NAME]: "js-sample-app",
}));

//const _traceExporter = new ConsoleSpanExporter();
const _traceExporter = new OTLPTraceExporter();
//const _traceExporter: new OTLPTraceExporter({url: 'grpc://otel-collector:4317'}),

const _spanProcessor = new BatchSpanProcessor(_traceExporter);

const _tracerConfig = {
  idGenerator: new AWSXRayIdGenerator(),
}

const _sampler = new TraceIdRatioBasedSampler(0.2); //set at 20% sampling rate

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
    new getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-express': {
        // We use a lot of middleware; it makes the traces way too noisy. If we
        // want telementry on a particular middleware, we should instrument it
        // manually.
        ignoreLayersType: [ExpressLayerType.MIDDLEWARE],
        ignoreLayers: [
          // These don't provide useful information to us.
          'router - /',
          'request handler - /*',
        ],
      },
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingPaths: [
          // paths we are not interested. e.g.: ping, healthcheck, etc.
        ],
      },
    }),
  ],
  resource: _resource,
  spanProcessor: _spanProcessor,
  traceExporter: _traceExporter,
  sampler: _sampler,
});
sdk.configureTracerProvider(_tracerConfig, _spanProcessor);

// this enables the API to record telemetry
sdk.start();
console.log('Tracing and Metrics has been started');

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing and Metrics terminated'))
    .catch((error) => console.log('Error terminating tracing and metrics', error))
    .finally(() => process.exit(0));
});

