from locust import HttpUser, FastHttpUser, TaskSet
from locust import events, task, constant
from locust.runners import MasterRunner, WorkerRunner

from urllib3 import PoolManager
from prometheus_client import start_http_server, Gauge

from collections import defaultdict


mystats = defaultdict(int)
gauge_num_connections = Gauge('num_connections', 'Description of num_connections')



class WebsiteUser(HttpUser):
    wait_time = constant(0)

    # All users will be limited to {maxsize} concurrent connections at most.
    #pool_manager = PoolManager(num_pools=10, maxsize=1024, block=True)

    #@task
    def index(self):
        self.client.get("/")

    @task
    def wait(self):
        mystats["num_connections"] += 1
        self.client.get("/wait?ms=100"
            ,timeout=5
            ,headers={'Connection':'close'}
        )

    #@task
    def relay(self):
        mystats["num_connections"] += 1
        resp = self.client.get("/relay?ms=100"
            ,timeout=5
            ,headers={'Connection':'close'}
        )

    





@events.init.add_listener
def on_init(environment, **_kwargs):
    if isinstance(environment.runner, MasterRunner):
        start_http_server(8000)

    if environment.web_ui:
        # this code is only run on the master node (the web_ui instance doesn't exist on workers)
        @environment.web_ui.app.route("/mystats")
        def get_mystats():
            """
            Add a route to the Locust web app, where we can see the total content-length
            """
            return mystats


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """
    Event handler that get triggered on start a new test
    """
    mystats.clear()


@events.reset_stats.add_listener
def on_reset_stats():
    """
    Event handler that get triggered on click of web UI Reset Stats button
    """
    mystats.clear()


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, context, **kwargs):
    mystats["num_connections"] -= 1


@events.report_to_master.add_listener
def on_report_to_master(client_id, data):
    """
    This event is triggered on the worker instances every time a stats report is
    to be sent to the locust master. It will allow us to add our extra content-length
    data to the dict that is being sent, and then we clear the local stats in the worker.
    """
    data["mystats"] = mystats.copy()
    mystats.clear()


@events.worker_report.add_listener
def on_worker_report(client_id, data):
    """
    This event is triggered on the master instance when a new stats report arrives
    from a worker. Here we just add the content-length to the master's aggregated
    stats dict.
    """
    for k,v in data["mystats"].items():
        mystats[k] += v
