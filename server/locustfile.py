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
        self.client.get("/wait?ms=100"
            ,timeout=5
            ,headers={'Connection':'close'}
        )

    @task
    def relay(self):
        self.client.get("/relay?ms=100"
            ,timeout=5
            ,headers={'Connection':'close'}
        )


'''
---------------------------------------------------------------
'''

from influxdb_client import Point
from influxdb_client.client.influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import WriteApi

influxdb_token = "j_jXVZmf6kIkL_Ik12BWP305ZptLRuiw8lGHhmtbhsX119nR4s2eSTrOLx09F0vX9gpfkafG5-zfsseQ3__j5w=="
influxdb_org = "Diligent"
influxdb_bucket = "web_test"

db_client: InfluxDBClient
write_api: WriteApi

latency = []


@events.init.add_listener
def on_init(environment, **_kwargs):
    global db_client
    global write_api

    if isinstance(environment.runner, MasterRunner):
        print("connecting to InfluxDB")
        while True:
            ready = False
            try:
                db_client = InfluxDBClient(url="http://localhost:8086", token=influxdb_token, org=influxdb_org)
                ready = db_client.ping()
            except:
                pass
            print(f"ready: {ready}")
            if ready:
                break
            sleep(3)
        
        write_api = db_client.write_api()


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, context, **kwargs):
    latency.append(response_time)


@events.report_to_master.add_listener
def on_report_to_master(client_id, data):
    """
    This event is triggered on the worker instances every time a stats report is
    to be sent to the locust master.
    """
    global latency
    
    data["mystats"] = latency
    latency = []


@events.worker_report.add_listener
def on_worker_report(client_id, data):
    """
    This event is triggered on the master instance when a new stats report arrives
    from a worker.
    """
    latency = data["mystats"]
    # report to influxdb
    record = [Point("latency").tag("worker", client_id).field("delay",float(value)) for value in latency]
    write_api.write(bucket=influxdb_bucket, org=influxdb_org, record=record)


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    latency.clear()


@events.reset_stats.add_listener
def on_reset_stats():
    latency.clear()
