from flask import Flask
import time
import requests

session = requests.session()

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from flask"

@app.route('/relay')
def echo():
    response = session.get('http://echo:8080')
    return '{}'.format(response.status_code)

@app.route('/wait/<ms>')
def profile(ms):
    time.sleep(int(ms)/1000.)
    return ms

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, processes=1, threaded=False)