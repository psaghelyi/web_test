all: ruby_base rails_base ruby_web_unicorn

ruby_base:
	docker build -t ruby_base -f Dockerfile.ruby_base .

rails_base:
	docker build -t rails_base -f Dockerfile.rails_base .

ruby_web_unicorn:
	docker build -t ruby_web_unicorn -f Dockerfile.unicorn .

run_ruby: all
	docker run -it --rm -p 8080:8080 ruby_base

run_rails: all
	docker run -it --rm -p 8080:8080 rails_base

run_web_unicorn: all
	docker run -it --rm -p 8080:8080 ruby_web_unicorn

