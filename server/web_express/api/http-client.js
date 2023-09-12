const axios = require('axios');
const { tracer, getTraceIdJson } = require('./otel-helpers');
const { trace, context, SpanKind, SpanStatusCode } = require('@opentelemetry/api');
const { NetTransportValues, SemanticAttributes } = require('@opentelemetry/semantic-conventions');

const httpClient = axios.create();

function configureHttpClient() {
  httpClient.interceptors.request.use(
    (config) => {
      const fullRequest = `${config.method.toUpperCase()} ${config.url}`;
      console.log('Outgoing Request:', fullRequest);
      const span = tracer.startSpan(fullRequest, {
        signal: 'trace', 
        language: 'javascript',    
        attributes: {
          [SemanticAttributes.HTTP_METHOD]: config.method.toUpperCase(),
          [SemanticAttributes.HTTP_URL]: config.url,
        },
        kind: SpanKind.CLIENT,
      });
      
      config.customData = span;
      return config;
    },
    (error) => {
      // Handle request errors
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  httpClient.interceptors.response.use(
    (response) => {
      const span = response.config.customData;
      span.setStatus({
        code: SpanStatusCode.OK,
      });
      span.end();
      
      console.log(`client spanId: ${span.spanContext().spanId}, parentSpanId: ${span.spanContext().parentSpanId}`);
      return response;
    },
    (error) => {
      // Handle response errors
      console.error('Response Error:', error);
      return Promise.reject(error);
    }
  );

}

module.exports = {
  httpClient,
  configureHttpClient,
}