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
    response = session.get('http://echo:8080/wait', params={'ms': ms})
    return response.content

@app.route('/wait')
def wait():
    ms = bottle.request.query.ms or '200'
    time.sleep(int(ms)/1000.)
    return ms

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
