FROM nginx

RUN apt-get -y update && apt-get -y install htop atop

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /www

COPY ./index.html /www

CMD ["nginx", "-g", "daemon off;"]
