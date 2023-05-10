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

bench:
	cd ../server; locust --master

clean:
	kubectl delete namespace --ignore-not-found=true web-test	
