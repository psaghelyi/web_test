registry = registry.127.0.0.1.nip.io:5000

all: build push

build:
	docker build -t $(registry)/web_golang .

push:
	docker push $(registry)/web_golang

run: build
	docker run -it --rm -p 80:5100 web_golang
