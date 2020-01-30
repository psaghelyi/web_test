from bottle import route, run, template, HTTPResponse
import time
import requests

session = requests.session()

@route('/')
def index():
    return 'hello from bottle'

@route('/relay')
def relay():
    response = session.get('http://echo:8080')
    return '{}'.format(response.status_code)

@route('/wait/<ms>')
def wait(ms):
    time.sleep(int(ms)/1000.)
    return ms

run(host='0.0.0.0', port=8080)
