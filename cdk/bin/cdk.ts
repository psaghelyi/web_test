#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { FargateClusterStack } from '../lib/fargate-cluster';

const app = new cdk.App();
new FargateClusterStack(app, 'WebTestCluster1', { 
    env: { account: '528896239059', region: 'eu-central-1' }, // team-atlantis
  });