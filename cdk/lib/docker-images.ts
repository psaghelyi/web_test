import { ContainerImage } from "aws-cdk-lib/aws-ecs";


export const locustImage = ContainerImage.fromRegistry('psaghelyi/locust:latest');
export const proxyImage = ContainerImage.fromRegistry('psaghelyi/proxy_nginx:latest');
export const webImage = ContainerImage.fromRegistry('psaghelyi/web_express:latest');
export const echoImage = ContainerImage.fromRegistry('psaghelyi/web_express:latest');

