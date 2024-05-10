all: fargate lambda

fargate:
	cdk deploy WebTestCluster1

lambda: build_lambda
	cdk deploy WebLambdaStack

build_lambda:
	cd ../server/web_lambda && make
