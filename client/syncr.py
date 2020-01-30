import requests
import time
from collections import defaultdict
from target import TARGET

session = requests.session()


def sleep(iterations):
    ts = time.time()
    for i in range(iterations):
        time.sleep(0.001)  # 1ms
    te = time.time()
    return {}, te - ts


def relay(iterations):
    status_codes = defaultdict(int)
    ts = time.time()
    for i in range(iterations):
        request = session.get('{}/relay'.format(TARGET))
        status_codes[request.status_code] += 1
    te = time.time()
    return status_codes, te - ts


def wait(iterations):
    status_codes = defaultdict(int)
    ts = time.time()
    for i in range(iterations):
        request = session.get('{}/wait/10'.format(TARGET))
        status_codes[request.status_code] += 1
    te = time.time()
    return status_codes, te - ts


def index(iterations):
    status_codes = defaultdict(int)
    ts = time.time()
    for i in range(iterations):
        request = session.get(TARGET)
        status_codes[request.status_code] += 1
    te = time.time()
    return status_codes, te - ts
