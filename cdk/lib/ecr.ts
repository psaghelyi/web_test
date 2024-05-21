import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';

const app = new cdk.App();
export class Ecr extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const unicornRepository = new ecr.Repository(this, "web_unicorn", {
            repositoryName: "web_unicorn"
        });

        const unicornXrayRepository = new ecr.Repository(this, "web_unicorn_xray", {
            repositoryName: "web_unicorn_xray"
        });

        const pumaRepository = new ecr.Repository(this, "web_puma", {
            repositoryName: "web_puma"
        });

        const pumaXrayRepository = new ecr.Repository(this, "web_puma_xray", {
            repositoryName: "web_puma_xray"
        });

        const proxyRepository = new ecr.Repository(this, "proxy_nginx", {
            repositoryName: "proxy_nginx"
        });

    }
}
