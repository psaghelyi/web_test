#!/bin/bash

influx setup \
    --name webtest \
    --host http://localhost:8086 \
    --org InfluxData \
    --bucket webtest \
    --password root1234 \
    --username root \
    --token secret-token \
    --force

