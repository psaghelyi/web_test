registry=$${REGISTRY:=psaghelyi}

all: build push

build:
	docker build -t $(registry)/web_golang .

push:
	docker push $(registry)/web_golang

run:
	docker run -it --rm -p 8080:8080 $(registry)/web_golang
