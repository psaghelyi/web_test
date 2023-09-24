import express from 'express';
import serverless from 'serverless-http';

import axios, { AxiosError } from 'axios';
import { logToActiveSpan } from './otelHelpers';
import { context, trace } from '@opentelemetry/api';

const app = express();


app.get('/', async (req, res) => {
  console.info(`Serving lambda request: ${req.method} ${req.path}`);
  
  const tracer = trace.getTracer('default');
  const span = tracer.startSpan(`incoming-request: ${req.method} ${req.path}`);
  context.with(trace.setSpan(context.active(), span), () => {
    span.setAttribute('custom-attribute', 'custom-value');
    console.log(`traceid: ${span.spanContext().traceId}`);
    span.end();
  });

  return res.status(200).type('text/plain').send('Hello from Lambda!');
});

app.get("/relay", async (req, res) => {
  console.info(`Serving lambda request: ${req.method} ${req.path}`);

  var target = decodeURI(req.query.target as string) || "http://echo.local:8080";
  var repeat = parseInt(req.query.repeat as string) || 1;
  
  const start = Date.now();
  while (repeat-- > 0) {
    try {
      await axios.get(target);
      console.log(`outgoing request ${repeat} to ${target}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Error making HTTP request:', axiosError.response.status, axiosError.response.statusText);
        return res.status(axiosError.response.status).send(axiosError.response.statusText);
      } else if (axiosError.request) {
        console.error('No response was received:', axiosError.request);
        return res.status(500).send('Failed to make HTTP request.');
      }
      console.error('Error setting up the request:', axiosError.message);
      return res.status(500).send('Failed to make HTTP request.');
    }
  }
  const elapsed = Date.now() - start;

  // I might need to reset the context here before I can log into the active span

  logToActiveSpan('Child calls being happened', {
    'webtest.target': target,
    'webtest.repeat': repeat.toString(),
    'webtest.duration': elapsed,      
  });

  return res.status(200).type('text/plain').send(elapsed.toString())
});

export const handler = serverless(app);
