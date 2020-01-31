from bottle import route, run, template, HTTPResponse
import time
import requests

session = requests.session()

@route('/')
def index():
    return 'hello from bottle'

@route('/relay')
def relay():
    t0 = time.perf_counter()
    response = session.get('http://echo:8080')
    t1 = time.perf_counter()
    for i in range(5000000):
        pass
    t2 = time.perf_counter()
    return '{:.2f},{:.2f}'.format((t1-t0) * 1000, (t2-t1) * 1000)

@route('/wait/<ms>')
def wait(ms):
    time.sleep(int(ms)/1000.)
    return ms

run(host='0.0.0.0', port=8080)
