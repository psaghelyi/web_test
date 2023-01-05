import bottle
import time
import requests


app = application = bottle.Bottle()
session = requests.session()


@app.route('/')
def index():
    return 'hello from bottle'


@app.route('/relay')
def relay():
    ms = bottle.request.query.ms or '0'
    t0 = time.time()
    res = session.get('http://echo:8080/wait', params={'ms': ms})
    if res.status_code < 300:
        return bottle.HTTPResponse(body=str(round((time.time() - t0) * 1000)))
    raise bottle.HTTPError(500)


@app.route('/wait')
def wait():
    ms = bottle.request.query.ms or '200'
    time.sleep(int(ms)/1000.)
    return ms


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
