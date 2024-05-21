registry=$${REGISTRY:=656912352974.dkr.ecr.us-west-2.amazonaws.com}

all: build tag push

build: build_web_unicorn build_web_unicorn_xray build_web_puma build_web_puma_xray

tag: login tag_unicorn tag_unicorn_xray tag_puma tag_puma_xray

push: login push_web_unicorn push_web_unicorn_xray push_web_puma push_web_puma_xray

build_ruby:
	docker build --platform linux/amd64 -t ruby_base -f Dockerfile.ruby_base .

build_rails_xray: build_ruby
	docker build --platform linux/amd64 -t rails_base_xray -f Dockerfile.rails_base_xray .

build_rails: build_ruby
	docker build --platform linux/amd64 -t rails_base -f Dockerfile.rails_base .

build_web_unicorn: build_rails
	docker build --platform linux/amd64 -t web_unicorn -f Dockerfile.unicorn .

build_web_puma: build_rails
	docker build --platform linux/amd64 -t web_puma -f Dockerfile.puma .

build_web_unicorn_xray: build_rails_xray
	docker build --no-cache --platform linux/amd64 -t web_unicorn_xray -f Dockerfile.unicorn_xray .

build_web_puma_xray: build_rails_xray
	docker build --platform linux/amd64 -t web_puma_xray -f Dockerfile.puma .

login:
	docker login --username AWS --password $$(aws-vault exec dil-team-destiny -- aws ecr get-login-password --region us-west-2) $(registry)

tag_unicorn:
	docker tag web_unicorn $(registry)/web_unicorn

tag_puma:
	docker tag web_puma $(registry)/web_puma

tag_unicorn_xray:
	docker tag web_unicorn_xray $(registry)/web_unicorn_xray

tag_puma_xray:
	docker tag web_puma_xray $(registry)/web_puma_xray

push_web_unicorn:
	docker push $(registry)/web_unicorn

push_web_puma:
	docker push $(registry)/web_puma

push_web_unicorn_xray:
	docker push $(registry)/web_unicorn_xray

push_web_puma_xray:
	docker push $(registry)/web_puma_xray

run_ruby: build_ruby
	docker run --platform linux/amd64 -it --rm ruby_base

run_rails: build_rails
	docker run --platform linux/amd64 -it --rm -p 8080:8080 rails_base

run_rails_xray: build_rails_xray
	docker run --platform linux/amd64 -it --rm -p 8080:8080 rails_base_xray

run_web_unicorn: build_web_unicorn
	docker run --platform linux/amd64 -it --rm -p 8080:8080 --add-host host.docker.internal:host-gateway $(registry)/web_unicorn

run_web_puma: build_web_puma
	docker run --platform linux/amd64 -it --rm -p 8080:8080 --add-host host.docker.internal:host-gateway $(registry)/web_puma

run_web_unicorn_xray: build_web_unicorn_xray
	docker run --platform linux/amd64 -it --rm -p 8080:8080 --add-host host.docker.internal:host-gateway $(registry)/web_unicorn_xray

run_web_puma_xray: build_web_puma_xray
	docker run --platform linux/amd64 -it --rm -p 8080:8080 --add-host host.docker.internal:host-gateway $(registry)/web_puma_xray
