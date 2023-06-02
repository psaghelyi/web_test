#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

import { FargateClusterStack } from '../lib/fargate-cluster';

const app = new cdk.App();
new FargateClusterStack(app, 'WebTestCluster', { 
    env: { account: '528896239059', region: 'eu-central-1' },
    
    clusterName: 'WebTestCluster'
  });