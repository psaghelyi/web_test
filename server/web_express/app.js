import express from 'express';
import http from 'http';
import { registerRoutes } from '~/api/routes';

const sdk = require("./nodeSDK");



const configureExpress = () => {
  let app = express();
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

sdk.nodeSDKBuilder()
    .then(() => {
      start();
    });

