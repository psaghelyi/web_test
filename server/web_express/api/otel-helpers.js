const api = require('@opentelemetry/api');

const tracer = api.trace.getTracer('js-app-tracer');
const common_span_attributes = { signal: 'trace', language: 'javascript' };


function getCurrentSpan() {
  return api.trace.getSpan(api.context.active());
}

function getTraceIdJson(span) {
  const otelTraceId = span.spanContext().traceId;
  const timestamp = otelTraceId.substring(0, 8);
  const randomNumber = otelTraceId.substring(8);
  const xrayTraceId = `1-${timestamp}-${randomNumber}`;
  return JSON.stringify({ "xrayTraceId": xrayTraceId });
}

function logToActiveSpan(message, attributes) {
  const span = getCurrentSpan();
  
  if (span) {
    // Log the message as an event on the active span
    span.addEvent(message, attributes);
    
    // Optionally, if you want to add attributes to the span
    if (attributes) {
      for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          span.setAttribute(key, attributes[key]);
        }
      }
    }
  }
}


module.exports = {
  tracer,
  getCurrentSpan,
  getTraceIdJson,
  logToActiveSpan
}
