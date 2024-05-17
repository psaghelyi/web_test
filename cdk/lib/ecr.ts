import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';

const app = new cdk.App();
export class Ecr extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const unicornRepository = new ecr.Repository(this, "web_unicorn", {
            repositoryName: "web_unicorn"
        });

        const unicornOtelRepository = new ecr.Repository(this, "web_unicorn_otel", {
            repositoryName: "web_unicorn_otel"
        });

        const pumaRepository = new ecr.Repository(this, "web_puma", {
            repositoryName: "web_puma"
        });

        const pumaOtelRepository = new ecr.Repository(this, "web_puma_otel", {
            repositoryName: "web_puma_otel"
        });

        const proxyRepository = new ecr.Repository(this, "proxy_nginx", {
            repositoryName: "proxy_nginx"
        });

    }
}
