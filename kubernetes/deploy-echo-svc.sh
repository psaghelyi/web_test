#!/bin/bash

kubectl create namespace web-test

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echo
  namespace: web-test
  labels:
    app: echo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: echo
  template:
    metadata:
      labels:
        app: echo
    spec:
      containers:
        - name: echo
          image: registry.127.0.0.1.nip.io:5000/web_golang
          ports:
            - containerPort: 8080 
EOF

kubectl --namespace web-test expose deployment echo --port=8080 --target-port=8080 --protocol=TCP --type=ClusterIP




