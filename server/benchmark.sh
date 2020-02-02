#!/usr/local/bin/bash

echo "Bash version ${BASH_VERSION}..."

locust -f locustfile.py --slave &
pid1=$!
locust -f locustfile.py --slave &
pid2=$!
locust -f locustfile.py --slave &
pid3=$!

COUNTER=0

for instance in {4..12}
do
    docker-compose up -d --scale web=$instance > /dev/null 2>&1
    sleep 2
    for user in {1..12} 20 50 100
    do
        ((COUNTER++))
        CSV="benchmark""_instance$instance""_user$user"
        echo "$COUNTER experience:"
        locust -f locustfile.py --csv=$CSV --no-web --run-time 2m -c $user -r '-1' --host 'http://127.0.01:8080' --expect-slaves 3
    done
    docker-compose down	
done

# expected 252
echo $COUNTER

echo OK

sleep 3

echo $pid1 $pid2 $pid3

kill -INT $pid1
kill -INT $pid2
kill -INT $pid3

read -p "Press enter to continue"
