import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import { registerRoutes } from '~/api/routes';
import { expressWinstonLogger } from './logger';

const configureExpress = () => {
  let app = express();
  app.use(compression());
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(expressWinstonLogger());
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
