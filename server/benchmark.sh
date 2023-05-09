#!/bin/bash

echo "Bash version ${BASH_VERSION}..."

locust -f locustfile.py --worker &
pid1=$!
locust -f locustfile.py --worker &
pid2=$!

COUNTER=0

for instance in {5..40..5} 45 50 60 80 100
do
    echo "WORKERS=$instance" > server.env
    docker-compose up -d > /dev/null 2>&1
    sleep 2
    for user in {5..40..5} 45 50 60 80 100
    do
        ((COUNTER++))
        CSV="benchmark""_instance$instance""_user$user"
        echo "$COUNTER experience:"
        locust -f locustfile.py --csv=$CSV --headless --run-time 2m --users $user --spawn-rate '-1' --host 'http://127.0.0.1:8080' --expect-slaves 2
    done
    docker-compose down	
done

# expected 252
echo $COUNTER

echo OK

sleep 3

echo $pid1 $pid2 $pid3

kill $pid1
kill $pid2

read -p "Press enter to continue"
