from fastapi import FastAPI
import time
import aiohttp
import asyncio

app = FastAPI()


@app.get("/")
async def read_root():
    return "hello world from fastAPI"


async def fetch(session, url):
    async with session.get(url) as response:
        return response.status, await response.text()


@app.get("/relay")
async def relay():
    t0 = time.time()
    async with aiohttp.ClientSession() as session:
        status_code, body = await fetch(session, 'http://echo:8080')
    t1 = time.time()
    #for i in range(2000000):
    #    pass
    t2 = time.time()
    return '{:.2f},{:.2f}'.format((t1-t0) * 1000, (t2-t1) * 1000)


@app.get("/wait/{ms}")
async def read_item(ms: int):
    await asyncio.sleep(ms/1000.)
    return ms


