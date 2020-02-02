from locust import HttpLocust, TaskSet, task, between

class UserBehavior(TaskSet):
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """

    def on_stop(self):
        """ on_stop is called when the TaskSet is stopping """

    #@task(1)
    def index(self):
        self.client.get("/")

    @task(1)
    def relay(self):
        self.client.get("/relay")

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    wait_time = between(0, 0)