from fastapi import FastAPI
import time
import requests
import aiohttp
import asyncio

app = FastAPI()

session = requests.session()


@app.get("/relay")
async def relay():
    response = session.get('http://echo:8080')
    return '{}'.format(response.status_code)


@app.get("/")
async def read_root():
    return "hello world from fastAPI"


async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()


'''
@app.get("/relay")
async def relay():
    async with aiohttp.ClientSession() as session:
        html = await fetch(session, 'http://echo:8080')
        return aiohttp.web.Response(text='{}'.format(response.status_code))

    
    response = session.get('http://echo:8080')
    return '{}'.format(response.status_code)
'''

@app.get("/wait/{ms}")
async def read_item(ms: int):
    time.sleep(ms/1000.)
    return ms


