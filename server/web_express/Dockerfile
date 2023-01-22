FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 8080

ENV WORKERS=2

ENTRYPOINT ["/bin/bash", "-c", "yarn start -i $WORKERS"]
