import api, { Attributes, Span } from '@opentelemetry/api';

export let getCurrentSpan = (): Span | undefined => {
  const context = api.context.active();
  const span = api.trace.getSpan(context);
  if (!span) {
    console.warn('No active span found.');
  }
  return span;
};

export function logToActiveSpan(message: string, attributes: Attributes) {
  const span = getCurrentSpan();

  if (span) {
    // Log the message as an event on the active span
    span.addEvent(message, attributes);

    // Optionally, if you want to add attributes to the span
    if (attributes) {
      span.setAttributes(attributes);
    }
  }
};
