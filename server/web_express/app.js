'use strict'

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const registerRoutes = require('./api/routes');
const { addTraceIdToRequest } = require('./api/otel-helpers');


const configureExpress = () => {
  let app = express();
  addTraceIdToRequest(app);
  morgan.token('traceid', (req) => req.traceId || '-');
  app.use(morgan(':method :url :status :response-time ms - :res[content-length] - traceID: :traceid'));
  registerRoutes(app);
  return app;
};

const configureHttpServer = app => {
  let server = http.createServer(app);
  server.listen(8080, () => {
    console.log('server listening on port 8080');
  });
  return server;
};

const start = () => {
  let app = configureExpress();
  configureHttpServer(app);
};


start();



