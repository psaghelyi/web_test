from locust import task, between, HttpUser, FastHttpUser


class WebsiteUser(FastHttpUser):
    wait_time = between(0, 0)

    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """

    def on_stop(self):
        """ on_stop is called when the TaskSet is stopping """

    #@task
    def index(self):
        self.client.get("/")

    @task
    def relay(self):
        self.client.get("/relay?ms=20")
