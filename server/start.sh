#!/bin/bash

cd ../monitoring; docker compose up -d; cd ../server

docker compose up --scale web=8 --scale locust=4 --build --remove-orphans -d

locust --master

docker compose down
