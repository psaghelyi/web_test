all: fargate lambda

fargate:
	cdk deploy WebTestCluster1

lambda: build
	cdk deploy WebLambdaStack

build:
	cd ../server/web_lambda && make
