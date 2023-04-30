all: build_web_unicorn build_web_puma

build_ruby:
	docker build -t ruby_base -f Dockerfile.ruby_base .

build_rails: build_ruby
	docker build -t rails_base -f Dockerfile.rails_base .

build_web_unicorn: build_rails
	docker build -t web_unicorn -f Dockerfile.unicorn .

build_web_puma: build_rails
	docker build -t web_puma -f Dockerfile.puma .

run_ruby: build_ruby
	docker run -it --rm -p 8080:8080 ruby_base

run_rails: build_rails
	docker run -it --rm -p 8080:8080 rails_base

run_web_unicorn: build_web_unicorn
	docker run -it --rm -p 8080:8080 web_unicorn

run_web_puma: build_web_puma
	docker run -it --rm -p 8080:8080 web_puma
