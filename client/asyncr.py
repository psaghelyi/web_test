import asyncio
from aiohttp import ClientSession
from target import TARGET

import time
from collections import defaultdict

MAX_PARALLELISM = 10

async def fetch(url, session):
    async with session.get(url) as response:
        body = await response.text()
        body.split(',')
        return response.status  # actual status code


async def bound_fetch(sem, url, session):
    # Getter function with semaphore.
    async with sem:
        return await fetch(url, session)


async def run(iterations, url):
    status_codes = defaultdict(int)
    ts = time.perf_counter()
    tasks = []

    sem = asyncio.Semaphore(10)

    # Fetch all responses within one Client session,
    # keep connection alive for all requests.
    async with ClientSession() as session:
        for i in range(iterations):
            # pass Semaphore and session to every GET request
            task = asyncio.ensure_future(bound_fetch(sem, url, session))
            tasks.append(task)
        statuses = await asyncio.gather(*tasks)
    te = time.perf_counter()
    for status in statuses:
        status_codes[status] += 1
    return status_codes, te - ts


def sleep(iterations):
    pass


def relay(iterations):
    loop = asyncio.get_event_loop()
    future = asyncio.ensure_future(run(iterations, '{}/relay'.format(TARGET)))
    return loop.run_until_complete(future)


def wait(iterations):
    loop = asyncio.get_event_loop()
    future = asyncio.ensure_future(run(iterations, '{}/wait/10').format(TARGET))
    return loop.run_until_complete(future)


def index(iterations):
    loop = asyncio.get_event_loop()
    future = asyncio.ensure_future(run(iterations, TARGET))
    return loop.run_until_complete(future)
