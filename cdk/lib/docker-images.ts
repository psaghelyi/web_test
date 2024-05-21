import { ContainerImage } from "aws-cdk-lib/aws-ecs";

export const proxyImage = ContainerImage.fromRegistry('656912352974.dkr.ecr.us-west-2.amazonaws.com/proxy_nginx:latest');
export const webImage = ContainerImage.fromRegistry('656912352974.dkr.ecr.us-west-2.amazonaws.com/web_unicorn:latest');
export const echoImage = ContainerImage.fromRegistry('656912352974.dkr.ecr.us-west-2.amazonaws.com/web_unicorn:latest');
export const webImageXray = ContainerImage.fromRegistry('656912352974.dkr.ecr.us-west-2.amazonaws.com/web_unicorn_xray:latest');
export const echoImageXray = ContainerImage.fromRegistry('656912352974.dkr.ecr.us-west-2.amazonaws.com/web_unicorn_xray:latest');

