

all: ruby_base rails_base ruby_web


ruby_base:
	docker build -t ruby_base -f Dockerfile.ruby_base .

rails_base:
	docker build -t rails_base -f Dockerfile.rails_base .

ruby_web:
	docker build -t ruby_web -f Dockerfile.app .

