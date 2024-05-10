registry=$${REGISTRY:=psaghelyi}

all: build push

build: build_web_unicorn build_web_puma

push: push_web_unicorn push_web_puma

build_ruby:
	docker build --platform linux/amd64 -t ruby_base -f Dockerfile.ruby_base .

build_rails: build_ruby
	docker build --platform linux/amd64 -t rails_base -f Dockerfile.rails_base .

build_web_unicorn: build_rails
	docker build --platform linux/amd64 -t $(registry)/web_unicorn -f Dockerfile.unicorn .

build_web_puma: build_rails
	docker build --platform linux/amd64 -t $(registry)/web_puma -f Dockerfile.puma .

push_web_unicorn:
	docker push $(registry)/web_unicorn

push_web_puma:
	docker push $(registry)/web_puma

run_ruby: build_ruby
	docker run --platform linux/amd64 -it --rm ruby_base

run_rails: build_rails
	docker run --platform linux/amd64 -it --rm -p 8080:8080 rails_base

run_web_unicorn: build_web_unicorn
	docker run --platform linux/amd64 -it --rm -p 8080:8080 --add-host host.docker.internal:host-gateway $(registry)/web_unicorn

run_web_puma: build_web_puma
	docker run --platform linux/amd64 -it --rm -p 8080:8080 --add-host host.docker.internal:host-gateway $(registry)/web_puma
