import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

export function addEcsRole(stack: cdk.Stack, id: string) : iam.Role {

    const ecsRole = new iam.Role(stack, id, {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Define an IAM policy statement to allow ECS access to ECR
    const ecrAccessPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            'ecr:BatchGetImage',
            'ecr:GetDownloadUrlForLayer',
            'ecr:GetAuthorizationToken',
        ],
        resources: ['*'], // Restrict to specific ECR repositories if needed
    });

    // Attach the policy statement to the ECS role
    ecsRole.addToPolicy(ecrAccessPolicy);

    return ecsRole;
}
