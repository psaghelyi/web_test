#!/bin/bash

aws-vault exec --no-session default -- \
docker compose down --rmi all


