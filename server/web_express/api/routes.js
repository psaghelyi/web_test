const { Router } = require ('express');
const { logToActiveSpan } = require ('./otel-helpers');
const { httpClient } = require ('./http-client');


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



const registerRoutes = (app) => {
  app.use('/', router);
};

module.exports = registerRoutes;
