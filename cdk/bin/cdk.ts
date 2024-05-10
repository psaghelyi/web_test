#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from "aws-cdk-lib";
import { FargateClusterStack } from '../lib/fargate-cluster';
import { WebLambdaStack } from '../lib/web-lambda';

const app = new cdk.App();
new FargateClusterStack(app, 'WebTestCluster1', { 
    env: { account: '528896239059', region: 'eu-central-1' }, // team-atlantis
  });
new WebLambdaStack(app, 'WebLambdaStack');
