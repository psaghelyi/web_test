FROM node:14
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
COPY . /app/
EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", "yarn start -i ${WORKERS:=2}"]
