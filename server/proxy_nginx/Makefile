registry=$${REGISTRY:=psaghelyi}

all: build push

build:
	docker build -t $(registry)/proxy_nginx .

push:
	docker push $(registry)/proxy_nginx

run: build
	docker run -it --rm -p 8000:8000 $(registry)/proxy_nginx
