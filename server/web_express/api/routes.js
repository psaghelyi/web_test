import { Router } from 'express';
import axios from 'axios';

let router = Router();

router.get("/", (req, res) => {
  res.status(200).send('hello from express');
})

router.get('/wait', async (req, res) => {
  try {
    const ms = req.query.ms
    setTimeout(function() {
      res.status(200).send(ms);
    }, parseInt(ms));    
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get("/relay", (req, res) => {
  var start = process.hrtime();
  axios.get("http://echo:8080/wait?ms=" + req.query.ms)
    .then(function(response) {
      var elapsed = process.hrtime(start)[1] / 1000000;
      res.status(200).json(Math.round(elapsed))
    }).catch(function(error) {
      res.sendStatus(500);
    })
})

export const registerRoutes = app => {
  app.use('/', router);
};
