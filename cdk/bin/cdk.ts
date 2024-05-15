#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from "aws-cdk-lib";
import { FargateClusterStack } from '../lib/fargate-cluster';
import { Ecr } from '../lib/ecr'
import { WebLambdaStack } from '../lib/web-lambda';

const app = new cdk.App();
new FargateClusterStack(app, 'WebTestCluster1', { 
    env: { account: '656912352974', region: 'us-west-2' }, // dil-team-destiny
});

new Ecr(app, 'EcrStack', {
    env: { account: '656912352974', region: 'us-west-2' }, // dil-team-destiny
});

new WebLambdaStack(app, 'WebLambdaStack');
