registry=$${REGISTRY:=656912352974.dkr.ecr.us-west-2.amazonaws.com}

all: build login tag push

build:
	docker build --platform linux/amd64 -t proxy_nginx .

login:
	docker login --username AWS --password $$(aws-vault exec dil-team-destiny -- aws ecr get-login-password --region us-west-2) $(registry)

tag:
	docker tag proxy_nginx $(registry)/proxy_nginx

push:
	docker push $(registry)/proxy_nginx

run: build
	docker run -it --rm -p 8000:8000 $(registry)/proxy_nginx
