#!/bin/bash

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
          image: ${REGISTRY:=psaghelyi}/web_golang
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              port: 8080
              path: /
EOF

kubectl --namespace web-test expose deployment echo




