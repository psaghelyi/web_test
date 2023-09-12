const { Router } = require ('express');
const { logToActiveSpan } = require ('./otel-helpers');
const { httpClient } = require ('./http-client');

const { NetTransportValues, SemanticAttributes } = require('@opentelemetry/semantic-conventions');
const { trace, context, SpanKind, SpanStatusCode } = require('@opentelemetry/api');

let router = Router();

router.get("/", async (req, res) => {
  res.status(200).send('hello from express');
})

router.get('/wait', async (req, res) => {
  try {
    const ms = parseInt(req.query.ms) || 200;
    setTimeout(() => {
      res.status(200).send(ms.toString());
    }, ms);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get('/waitrnd', async (req, res) => {
  try {
    const ms = Math.floor(Math.random() * (parseInt(req.query.ms) || 200));
    setTimeout(() => {
      res.status(200).send(ms.toString());
    }, ms);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get("/relay", async (req, res) => {
  var target = decodeURI(req.query.target) || "http://echo:8080";
  var repeat = parseInt(req.query.repeat) || 1;
  try {
    const start = Date.now();
    while (repeat--) {
      const response = await httpClient.get(target);

      if (response.status !== 200) {
        res.sendStatus(500);
        return;
      }
    }
    const elapsed = Date.now() - start;

    logToActiveSpan('Child calls being happened', {
      'webtest.target': target,
      'webtest.duration': elapsed,
    });

    res.status(200).send(elapsed.toString())
  } catch (error) {
    res.sendStatus(500);
  }
});

const otelMiddleware = async (req, res, next) => {
  console.log('Incoming request:', `${req.method} ${req.url}`);

  const span = tracer.startSpan(`GET /user/:id`, {
    signal: 'trace', 
    language: 'javascript',
    // attributes can be added when the span is started
    attributes: {
      // Attributes from the HTTP trace semantic conventions
      // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/http.md
      [SemanticAttributes.HTTP_METHOD]: req.method,
      [SemanticAttributes.HTTP_FLAVOR]: req.httpVersion,
      [SemanticAttributes.HTTP_URL]: req.url,
      //[SemanticAttributes.NET_PEER_IP]: " 192.0.2.5",
    },
    // This span represents a remote incoming synchronous request
    kind: SpanKind.SERVER,
    root: true,
  });
  console.log(`server spanId: ${span.spanContext().spanId}`);

  // Create a new context from the current context which has the span "active"
  const ctx = trace.setSpan(context.active(), span);

  await context.with(ctx, next);
  
  span.setAttribute("http.status_code", res.statusCode);

  console.log(`response: ${res.statusCode} - ${getTraceIdJson(span)}`);
};

const registerRoutes = (app) => {
  //app.use(otelMiddleware);
  app.use('/', router);
};

module.exports = registerRoutes;
