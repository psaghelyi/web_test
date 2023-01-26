all: docker


clean: clean_monitoring

clean_monitoring: FORCE
	cd monitoring && docker-compose down && cd ..

monitoring: FORCE
	cd monitoring && docker-compose up --detach && cd ..

locust: FORCE
	cd server/locust && make && cd ../..

server: FORCE
	cd server && docker-compose up --detach && locust --master && cd ..

docker: monitoring locust server


	
FORCE:

