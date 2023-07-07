import { Router } from 'express';
import axios from 'axios';

const parseInteger = require('./parse_integer.js');

let router = Router();

router.get("/", (req, res) => {
  res.status(200).send('hello from express');
})

router.get('/wait', async (req, res) => {
  try {
    const ms = parseInt(req.query.ms) || 200;
    setTimeout(function() {
      res.status(200).send(ms.toString());
    }, ms);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get("/relay", (req, res) => {
  var target = req.query.target || "http://echo:8080";
  const start = Date.now();
  axios.get(target)
    .then(function(response) {
      const elapsed = Date.now() - start;
      res.status(200).send(elapsed.toString())
    }).catch(function(error) {
      res.sendStatus(500);
    })
})

export const registerRoutes = app => {
  app.use('/', router);
};
