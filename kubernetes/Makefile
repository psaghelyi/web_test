all: echo web locust run bench clean

locust:
	cd ../server/locust; make;

echo:
	cd ../server/web_golang; make;

web:
	cd ../server/web_rubyrails; make;

run: clean
	kubectl create namespace web-test
	./echo.sh
	./web.sh
	./locust.sh

inject:
	kubectl wait --for=condition=Ready pod --all -n web-test
	kubectl get -n web-test deploy -o yaml | linkerd inject - | kubectl apply -f -

bench:
	cd ../server; locust --master

clean:
	kubectl delete namespace --ignore-not-found=true web-test	
