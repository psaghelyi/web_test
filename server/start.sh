#!/bin/bash

docker-compose up --scale web=1 --scale locust=4 --remove-orphans > /dev/null 2>&1 &
pid0=$!

locust --master

kill $pid0


