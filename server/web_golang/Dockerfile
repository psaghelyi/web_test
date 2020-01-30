FROM golang:1.8

RUN apt-get -y update && apt-get -y install htop atop

WORKDIR /go/src/app
COPY . .

RUN go get -d -v ./...
RUN go install -v ./...

CMD ["app"]