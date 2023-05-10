registry = registry.127.0.0.1.nip.io:5000

all: build push

build:
	docker build -t $(registry)/locust .

push:
	docker push $(registry)/locust
