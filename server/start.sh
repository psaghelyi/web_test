#!/bin/bash

docker-compose up --scale web=$1 > /dev/null 2>&1

#python ../client/client.py
