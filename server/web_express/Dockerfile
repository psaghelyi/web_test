FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 8080

ENV PROCESS=1

ENTRYPOINT ["/bin/bash", "-c", \
    "yarn start -i $PROCESS"]
