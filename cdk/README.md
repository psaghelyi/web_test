# Welcome to your CDK TypeScript project

Attaching to a running task in AWS:

`aws ecs execute-command --cluster <cluster-name> --task <task-id> --container <container-name> --command "/bin/bash" --interactive --container WebContainer`

e.g.:

`aws ecs execute-command --cluster WebTestCluster1-WebtestClusterE2CD5C12-stR5J6j6asXC --task 6c938a3e9fce4e37a9f85b5f51fb5a9e --command "/bin/bash" --interactive --container WebContainer`