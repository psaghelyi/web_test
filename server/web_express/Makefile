registry=$${REGISTRY:=psaghelyi}

all: build push

build:
	yarn install
	docker build -t $(registry)/web_express .

push:
	docker push $(registry)/web_express

run:
	docker run -it --rm -p 8080:8080 -e WORKERS=5 $(registry)/web_express
