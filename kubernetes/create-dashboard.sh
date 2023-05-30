#!/bin/bash


curl -X POST \
  -u admin:admin1234 \
  -H 'Content-Type: application/json' \
  -d @dashboard.json \
  http://localhost:3000/api/dashboards/db
