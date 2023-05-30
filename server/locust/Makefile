registry = psaghelyi

all: build push

build:
	docker build -t $(registry)/locust .

push:
	docker push $(registry)/locust
