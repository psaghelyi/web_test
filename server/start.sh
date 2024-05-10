#!/bin/bash

aws-vault exec --no-session atlantis -- \
docker compose up \
    --scale echo=1 \
    --scale web=1 \
    --remove-orphans \
    --build \
    --detach


