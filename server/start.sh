#!/bin/bash

#docker-compose up --scale web=$1 > /dev/null 2>&1

docker-compose up --scale web=4 --scale echo=4 --remove-orphans > /dev/null 2>&1
#docker-compose up > /dev/null 2>&1

#python ../client/client.py
