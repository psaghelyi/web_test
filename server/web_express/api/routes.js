import { Router } from 'express';
import axios from 'axios';
import { instrumentRequest, addAttributeToCurrentSpan } from './instrument-request';

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
    const ms = Math.floor(Math.random() *  (parseInt(req.query.ms) || 200));
    setTimeout(() => {
      res.status(200).send(ms.toString());
    }, ms);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get("/relay", async (req, res) => {
  var target = decodeURI(req.query.target) || "http://echo:8080";
  const traceid = await instrumentRequest('relay-http-call', async () => {
    try {
      const start = Date.now();
      const response = await axios.get(target);

      if (response.status !== 200) {
        res.sendStatus(500);
        return;
      }
      
      const elapsed = Date.now() - start;
      res.status(200).send(elapsed.toString())
    } catch (error) {
      res.sendStatus(500);
    }
  });
  console.log(`${traceid}`);
});

const otelMiddleware = async (req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  const span = await instrumentRequest('incoming-http-call', async () => {
    // Call the next middleware function
    await next();
    addAttributeToCurrentSpan('http.request.method', req.method);
    addAttributeToCurrentSpan('http.url', req.url);
    addAttributeToCurrentSpan('http.response.status_code', res.statusCode);
  });
};

export const registerRoutes = app => {
  app.use(otelMiddleware);
  app.use('/', router);
};
