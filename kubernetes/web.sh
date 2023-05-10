#!/bin/bash

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: web-test
  name: nginx-conf
data:
  nginx.conf: |-
    worker_processes  1;
    events {
      worker_connections  1024;
      use epoll;
    }
    http {
      sendfile on;
      tcp_nopush on;
      tcp_nodelay on;
      proxy_next_upstream error;
      upstream web {
        server 127.0.0.1:8080;
        #server unix:/sockets/unicorn.sock fail_timeout=0;
        keepalive 32;
      }
      server {
        listen 8000;
        location / {
          proxy_redirect off;
          proxy_buffering off;
          proxy_pass http://web;
          proxy_http_version 1.1;
          proxy_set_header "Connection" "";  # remove close
          proxy_connect_timeout 5s;
          #proxy_send_timeout 10s;
          proxy_read_timeout 5s;
          #send_timeout 10s;
        }
      } 
    }
EOF

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: web-test
  labels:
    app: web
spec:
  replicas: 8
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: registry.127.0.0.1.nip.io:5000/web_unicorn
          env:
            - name: WORKERS
              value: "5"
          ports:
            - containerPort: 8080
              name: web
          livenessProbe:
            httpGet:
              port: 8080
              path: /
            timeoutSeconds: 5
            failureThreshold: 3
        - name: proxy
          image: nginx:alpine
          ports:
            - containerPort: 8000
              name: proxy
          livenessProbe:
            httpGet:
              port: 8000
              path: /
            timeoutSeconds: 5
            failureThreshold: 3
          volumeMounts:
            - name: nginx-proxy-config
              mountPath: /etc/nginx/nginx.conf
              subPath: nginx.conf
      volumes:
        - name: nginx-proxy-config
          configMap:
            name: nginx-conf
          
EOF

kubectl --namespace web-test expose deployment web




