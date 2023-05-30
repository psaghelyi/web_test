registry = psaghelyi

all: build push

build:
	docker build -t $(registry)/proxy_nginx .

push:
	docker push $(registry)/proxy_nginx

run: build
	docker run -it --rm -p 80:8080 proxy_nginx
