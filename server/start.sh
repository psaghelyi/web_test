#!/bin/bash

aws-vault exec --no-session default -- \
docker compose up \
    --scale echo=4 \
    --scale web=4 \
    --scale locust=4 \
    --build \
    --remove-orphans \
    --detach


