import os
import json
import logging

from locust import HttpUser, FastHttpUser, TaskSet
from locust import events, task, constant
from locust.runners import MasterRunner, WorkerRunner

from urllib3 import PoolManager
from time import sleep


class WebsiteUser(FastHttpUser):
    wait_time = constant(0)

    # All users will be limited to {maxsize} concurrent connections at most.
    #pool_manager = PoolManager(num_pools=10, maxsize=1024, block=True)

    #@task
    def index(self):
        self.client.get("/"
            ,timeout=5
            ,headers={'Connection':'close'}
        )

    #@task
    def wait(self):
        self.client.get("/wait?ms=200"
            ,timeout=5
            ,headers={'Connection':'close'}
        )

    @task
    def relay(self):
        self.client.get("/relay?target=http://echo.local:8080/waitrnd?ms=200"
            ,timeout=5
            ,headers={'Connection':'close'}
        )

    #@task
    def batch_relay(self):
        self.client.get("/batch_relay?batch=10&target=http://echo.local:8080/waitrnd?ms=200"
            ,timeout=5
            ,headers={'Connection':'close'}
        )


'''---------------------------------------------------------------'''

from influxdb_client import Point
from influxdb_client.client.influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import WriteApi

influxdb_options = {
    "url":     os.environ.get("INFLUXDB_PATH", "http://localhost:8086"),
    "token":   os.environ.get("INFLUXDB_TOKEN", "secret-token"),
    "org":     os.environ.get("INFLUXDB_ORG", "InfluxData"),
    "bucket":  os.environ.get("INFLUXDB_BUCKET", "webtest"),
}

write_api: WriteApi

latency = []


@events.init.add_listener
def on_init(environment, **_kwargs):
    global write_api

    logging.getLogger().setLevel(level=os.getenv('LOGGER_LEVEL', 'INFO').upper())

    if isinstance(environment.runner, MasterRunner):
        logging.debug(f'init params =\n {json.dumps(influxdb_options, indent=2)}')
        logging.info("connecting to InfluxDB")
        while True:
            ready = False
            try:
                db_client = InfluxDBClient(url=influxdb_options["url"], token=influxdb_options["token"], org=influxdb_options["org"])
                ready = db_client.ping()
            except:
                pass
            logging.info(f"ready: {ready}")
            if ready:
                break
            sleep(3)
        
        write_api = db_client.write_api()


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, context, **kwargs):
    latency.append(response_time)


'''
This event is triggered on the worker instances every time a stats report is
to be sent to the locust master.
'''
@events.report_to_master.add_listener
def on_report_to_master(client_id, data):
    global latency
    if not latency:
        return    
    data["mystats"] = latency
    latency = []


'''
This event is triggered on the master instance when a new stats report arrives
from a worker.
'''
@events.worker_report.add_listener
def on_worker_report(client_id, data):
    global write_api
    if not write_api or "mystats" not in data or not data["mystats"]:
        return    
    latency = data["mystats"]
    # report to influxdb
    record = [Point("latency").tag("worker", client_id).field("delay",float(value)) for value in latency]
    write_api.write(bucket=influxdb_options["bucket"], org=influxdb_options["org"], record=record)


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    latency.clear()


@events.reset_stats.add_listener
def on_reset_stats():
    latency.clear()
