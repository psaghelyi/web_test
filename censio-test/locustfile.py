import json
import psycopg2

from locust import task, constant, events, HttpUser
from locust.contrib.fasthttp import FastHttpSession, FastHttpUser
from locust.runners import MasterRunner

from random import seed, choice


COMPANY_ID="92e67558-d068-445a-907f-2716a8483f18"

seed(1)


class RdsClient():
    def __init__(self):
        self._conn = psycopg2.connect(
            dbname='ubi3', 
            host='staging.c1lgbejichv8.us-east-1.rds.amazonaws.com', 
            port=5432, 
            user='censio', 
            password='staging123')

    def __del__(self):
        if self._conn is not None:
            self._conn.close()

    def get_phone_numbers(self):
        cursor = self._conn.cursor()
        cursor.execute(f"select phone_number from enrollment_records where company_id='{COMPANY_ID}'")
        raw = cursor.fetchall()
        ret = [phone_number[0] for phone_number  in raw]
        print(ret)
        return ret


    def get_confirmation_code(self, confirmation_id):
        cursor = self._conn.cursor()
        cursor.execute(f"select code from phone_confirmations where id='{confirmation_id}'")
        row = cursor.fetchone()
        return row[0]


rds_client = None
phone_numbers = []
confirmations = {}

@events.init.add_listener
def on_locust_init(environment, **kwargs):
    global rds_client
    global phone_numbers

    #if isinstance(environment.runner, MasterRunner):
    #    print("I'm on master node")
    #else:
    #    print("I'm on a worker or standalone node")        
    rds_client = RdsClient()
    phone_numbers = rds_client.get_phone_numbers()
    

class MyUser(HttpUser):
    wait_time = constant(0)

    @task
    def initiate_confirmation(self):
        phone_number = choice(phone_numbers)
        # body = json.dumps({'phone_number': phone_number}) 
        # headers = {"Content-Type": "application/json"}

        response = self.client.post(
            f'/ubi3/v1/companies/{COMPANY_ID}/phone-confirmations',
            json={'phone_number': phone_number}
        )        

        if response.status_code == 200:
            confirmation_id = response.json()['confirmation_id']
            confirmations[confirmation_id] = rds_client.get_confirmation_code(confirmation_id)

    @task
    def send_confirmation(self):
        if not confirmations:
            return

        confirmation_id = choice(list(confirmations))
        code = confirmations[confirmation_id]
        response = self.client.post(
            f'/ubi3/v1/companies/{COMPANY_ID}/phone-confirmations/{confirmation_id}/confirm?code={code}&include_enrollment=true')

