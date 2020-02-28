import { Router } from 'express';
import request from 'sync-request';

let router = Router();

router.get('/', (req, res) => {
  res.status(200).send('hello from express');
});

router.get('/wait/:ms', async (req, res) => {
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    await timeout(parseInt(req.params.ms));
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('ERROR');
  }
});

router.get('/relay', (req, res) => {
  try {
    let result = request('GET', 'http://echo:8080');
    res.status(200).send(result.statusCode);
  } catch (e) {
    res.status(500).send('ERROR');
  }
});

export const registerRoutes = app => {
  app.use('/', router);
};
