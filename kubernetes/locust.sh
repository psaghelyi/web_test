#!/bin/bash

kubectl create configmap locustfile --namespace web-test --from-file ../server/locustfile.py

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: locust
  namespace: web-test
  labels:
    app: locust
spec:
  replicas: 4
  selector:
    matchLabels:
      app: locust
  template:
    metadata:
      labels:
        app: locust
    spec:
      containers:
        - name: locust
          image: ${REGISTRY:=registry.127.0.0.1.nip.io:5000}/locust
          args: ["-f", "/locust/locustfile.py", "--worker", "--master-host", "host.k3d.internal"]
          volumeMounts:
            - name: locustfile
              mountPath: /locust/locustfile.py
              subPath: locustfile.py
      volumes:
        - name: locustfile
          configMap:
            name: locustfile
          
EOF

