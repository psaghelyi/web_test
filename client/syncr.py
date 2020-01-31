import requests
import time
from collections import defaultdict
from target import TARGET

MAX_PARALLELISM = 10

session = requests.session()


def sleep(iterations):
    ts = time.perf_counter()
    for i in range(iterations):
        time.sleep(0.001)  # 1ms
    te = time.perf_counter()
    return {}, te - ts


def relay(iterations):
    status_codes = defaultdict(int)
    ts = time.perf_counter()
    for i in range(iterations):
        request = session.get('{}/relay'.format(TARGET))
        status_codes[request.status_code] += 1
    te = time.perf_counter()
    return status_codes, te - ts


def wait(iterations):
    status_codes = defaultdict(int)
    ts = time.perf_counter()
    for i in range(iterations):
        request = session.get('{}/wait/10'.format(TARGET))
        status_codes[request.status_code] += 1
    te = time.perf_counter()
    return status_codes, te - ts


def index(iterations):
    status_codes = defaultdict(int)
    ts = time.perf_counter()
    for i in range(iterations):
        request = session.get(TARGET)
        status_codes[request.status_code] += 1
    te = time.perf_counter()
    return status_codes, te - ts
