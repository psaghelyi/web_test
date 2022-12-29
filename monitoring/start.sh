#!/bin/bash

if [[ $(docker ps -a --filter="name=portainer" --filter "status=exited" | grep -w "portainer") ]]; then
    echo "portainer exited."
elif [[ $(docker ps -a --filter="name=portainer" --filter "status=running" | grep -w "portainer") ]]; then
    echo "portainer is running."
else
    docker volume create portainer_data
    docker run -d \
        -p 9000:9000 \
        --name portainer \
        --restart=always \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        portainer/portainer-ce:latest
fi


