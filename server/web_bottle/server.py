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
    response = session.get('http://echo:8080')
    t1 = time.time()
    #for i in range(2000000):
    #    pass
    t2 = time.time()
    return '{:.2f},{:.2f}'.format((t1-t0) * 1000, (t2-t1) * 1000)

@app.route('/wait/<ms>')
def wait(ms):
    time.sleep(int(ms)/1000.)
    return ms

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
