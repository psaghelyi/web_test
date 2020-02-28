import { Router, response } from 'express';
import request from 'request';

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
    res.sendStatus(500);
  }
});

router.get('/relay', async (req, res) => {
  const httpRequest = url =>
    new Promise((resolve, reject) => {
      request.get(url, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    });

  try {
    const result = await httpRequest('http://index.hu');
    res.status(200).send(result.statusCode);
  } catch (e) {
    res.sendStatus(500);
  }
});

export const registerRoutes = app => {
  app.use('/', router);
};
