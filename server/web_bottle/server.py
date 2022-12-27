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
    t0 = time.time()
    ms = bottle.request.query.ms or '0'
    headers = {"ms": ms}
    response = session.get('http://echo:8080/wait', headers=headers)
    t = time.time()
    return '{:.2f}'.format((t-t0) * 1000)

@app.route('/wait')
def wait():
    ms = bottle.request.query.ms or '200'
    time.sleep(int(ms)/1000.)
    return ms

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
