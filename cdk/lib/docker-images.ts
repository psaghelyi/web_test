import { ContainerImage } from "aws-cdk-lib/aws-ecs";


export const locustImage = ContainerImage.fromRegistry('psaghelyi/locust');
export const proxyImage = ContainerImage.fromRegistry('psaghelyi/proxy_nginx');
export const webImage = ContainerImage.fromRegistry('psaghelyi/web_unicorn');
export const echoImage = ContainerImage.fromRegistry('psaghelyi/web_golang');

