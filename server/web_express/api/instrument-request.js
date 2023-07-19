const api = require('@opentelemetry/api');

const tracer = api.trace.getTracer('js-app-tracer');
const common_span_attributes = { signal: 'trace', language: 'javascript' };

export function getTraceIdJson() {
  const otelTraceId = api.trace.getSpan(api.context.active()).spanContext().traceId;
  const timestamp = otelTraceId.substring(0, 8);
  const randomNumber = otelTraceId.substring(8);
  const xrayTraceId = "1-" + timestamp + "-" + randomNumber;
  return JSON.stringify({ "traceId": xrayTraceId });
}

export async function instrumentRequest(spanName, _callback) {
  const span = tracer.startSpan(spanName, {
    attributes: common_span_attributes
  });
  const ctx = api.trace.setSpan(api.context.active(), span);
  await api.context.with(ctx, async () => {
    console.log(`Responding to ${spanName}`);
    await _callback();
    span.end();
  });
  return span;
}

export function addAttributeToCurrentSpan(attribute) {
  const span = api.trace.getSpan(api.context.active());
  span.setAttribute(attribute.key, attribute.value);
}