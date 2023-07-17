FROM golang:1.19 as builder

WORKDIR /app

RUN go mod init app

ADD . .

RUN go get

RUN go mod tidy

RUN go build -o app


FROM amazonlinux:2023

WORKDIR /app

EXPOSE 8080

ENV GIN_MODE=release

COPY --from=builder /app/app .

CMD [ "./app" ]
