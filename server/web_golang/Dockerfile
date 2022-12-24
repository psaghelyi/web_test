FROM golang:1.18

WORKDIR /app

RUN go mod init app

ADD . .

RUN go get

RUN go mod tidy

EXPOSE 8080

ENV GIN_MODE=release

CMD [ "go", "run", "main.go" ]