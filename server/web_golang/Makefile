registry = psaghelyi

all: build push

build:
	docker build -t $(registry)/web_golang .

push:
	docker push $(registry)/web_golang

run: build
	docker run -it --rm -p 80:5100 web_golang
