#!/bin/bash

docker-compose up --scale web=8 --scale locust=4 --build --remove-orphans &# > /dev/null 2>&1 &
pid0=$!

locust --master

kill $pid0


