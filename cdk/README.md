# Welcome to your CDK TypeScript project

`$ aws ecs list-clusters`

Yields the cluster names, e.g. ecs-demo-EcsCluster-mWkD7Y4zt5W5

`$ aws ecs list-tasks --cluster ecs-demo-EcsCluster-mWkD7Y4zt5W5`

Yields the task IDs, e.g. 11f37244484b486e9e0eda9b94cc9f74

```
$ aws ecs describe-tasks \
--cluster ecs-demo-EcsCluster-mWkD7Y4zt5W5 \
--task 11f37244484b486e9e0eda9b94cc9f74
```

Yields the container names in the task, e.g. nginx

Now finally build the “aws ecs execute-command”…

```
$ aws ecs execute-command \
--cluster ecs-demo-EcsCluster-mWkD7Y4zt5W5 \
--task 11f37244484b486e9e0eda9b94cc9f74 \
--container nginx \
--command “/bin/bash” \
--interactive
```

Attaching to a running task in AWS:

`aws ecs execute-command --cluster <cluster-name> --task <task-id> --container <container-name> --command "/bin/bash" --interactive --container WebContainer`

e.g.:

`aws ecs execute-command --cluster WebTestCluster1-WebtestClusterE2CD5C12-stR5J6j6asXC --task 6c938a3e9fce4e37a9f85b5f51fb5a9e --command "/bin/bash" --interactive --container WebContainer`
