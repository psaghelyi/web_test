import * as ecs from '@aws-cdk/aws-ecs';

export const locustImage = ecs.ContainerImage.fromRegistry('psaghelyi/locust');
export const webImage = ecs.ContainerImage.fromRegistry('psaghelyi/web_unicorn');
export const echoImage = ecs.ContainerImage.fromRegistry('psaghelyi/web_golang');

