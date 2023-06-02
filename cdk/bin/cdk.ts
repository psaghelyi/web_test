#!/usr/bin/env node
import "source-map-support/register";
// import { App } from "aws-cdk-lib";
import { FargateClusterStack } from '../lib/fargate-cluster';
import { App } from "aws-cdk-lib";

const app = new App();
new FargateClusterStack(app, 'WebTestCluster', { 
    env: { account: '528896239059', region: 'eu-central-1' },
    
    // clusterName: 'WebTestCluster'
  });