FROM node:14
RUN apt-get update && apt-get install -y openssh-server
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
COPY . /app/
EXPOSE 8080
EXPOSE 22

ENTRYPOINT ["/bin/bash", "-c", "yarn start-pm2 -i ${WORKERS:=2}"]
