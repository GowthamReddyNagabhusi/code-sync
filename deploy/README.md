# CodeSync Backend — AWS Deployment Guide

Production deployment of the Spring Boot backend to **Amazon ECS Fargate** in `ap-south-1`.

---

## Architecture

```
Internet
    │
    ▼
Application Load Balancer  (sg-0adfbe05c8a560a68)
    │  /actuator/health/readiness → 200 OK
    ▼
ECS Fargate Task            (sg-051362f67b0ce41c1)
  codesync-backend:latest
  cpu: 256  memory: 512MB
    │                   │
    ▼                   ▼
Amazon RDS          ElastiCache Redis
PostgreSQL 16       (codesync-redis)
(codesync-db)
```

---

## Infrastructure Reference (Already Provisioned)

| Resource | ID / Endpoint |
|----------|--------------|
| VPC | `vpc-029546ae99b7e44b5` |
| Public Subnet A | `subnet-0ffcb0872f4dd2654` |
| Public Subnet B | `subnet-0a65e859b26c25db2` |
| Private Subnet A | `subnet-0b0c9a9e7da189a4c` |
| Private Subnet B | `subnet-01e122dc6907f2738` |
| ALB Security Group | `sg-0adfbe05c8a560a68` |
| ECS Security Group | `sg-051362f67b0ce41c1` |
| RDS Endpoint | `codesync-db.cheaim62i2d4.ap-south-1.rds.amazonaws.com:5432` |
| ECR Repository | `649424354235.dkr.ecr.ap-south-1.amazonaws.com/codesync` |

---

## Files in This Folder

| File | Purpose | When to run |
|------|---------|-------------|
| `create-secrets.sh` | Seed Secrets Manager | Once, before first deploy |
| `build.sh` | Build Docker image locally | Every new version |
| `push.sh` | Push image to ECR | After build |
| `deploy.sh` | Register task + update service | After push |
| `ecs-task-definition.json` | Task definition template | Referenced by deploy.sh |

---

## Step 1 — IAM Roles (One-Time Setup)

ECS requires two roles. Create them if they don't exist.

### ecsTaskExecutionRole

Allows ECS to pull images from ECR and fetch secrets from Secrets Manager.

```bash
# Create the role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --region ap-south-1

# Standard ECS policy (ECR pull + CloudWatch logs)
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Secrets Manager read access
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### ecsTaskRole

Assumed by the running container (for any AWS SDK calls from within the app).

```bash
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --region ap-south-1
```

---

## Step 2 — CloudWatch Log Group (One-Time Setup)

```bash
aws logs create-log-group \
  --log-group-name /ecs/codesync-backend \
  --region ap-south-1

# Optional: set retention (e.g., 30 days)
aws logs put-retention-policy \
  --log-group-name /ecs/codesync-backend \
  --retention-in-days 30 \
  --region ap-south-1
```

---

## Step 3 — Secrets Manager (One-Time Setup)

Edit `create-secrets.sh` and fill in every `<YOUR_...>` placeholder.

**Generate a strong JWT secret:**
```bash
openssl rand -hex 64
```

Run the script:
```bash
chmod +x deploy/create-secrets.sh
./deploy/create-secrets.sh
```

Verify all four secrets exist:
```bash
aws secretsmanager list-secrets \
  --region ap-south-1 \
  --query 'SecretList[?starts_with(Name, `codesync/prod`)].Name'
```

Expected output:
```json
["codesync/prod/database","codesync/prod/security","codesync/prod/oauth","codesync/prod/openai"]
```

**Why separate secrets?**
- Least-privilege: future microservices only get access to what they need
- Independent rotation: DB password rotation doesn't touch OAuth secrets
- Better audit trail in CloudTrail

---

## Step 4 — Update the Task Definition

Before deploying, replace the one placeholder in `ecs-task-definition.json`:

```json
{
  "name": "REDIS_HOST",
  "value": "<YOUR_ELASTICACHE_PRIMARY_ENDPOINT>"
}
```

Find your ElastiCache endpoint:
```bash
aws elasticache describe-replication-groups \
  --replication-group-id codesync-redis \
  --region ap-south-1 \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint'
```

---

## Step 5 — Build and Push the Image

```bash
# Build
chmod +x deploy/build.sh
./deploy/build.sh

# Verify it built
docker images codesync-backend

# Push to ECR
chmod +x deploy/push.sh
./deploy/push.sh
```

---

## Step 6 — Create the ECS Cluster (One-Time)

```bash
aws ecs create-cluster \
  --cluster-name codesync-cluster \
  --capacity-providers FARGATE \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
  --region ap-south-1
```

---

## Step 7 — Register the Task Definition (First Time)

```bash
aws ecs register-task-definition \
  --cli-input-json file://deploy/ecs-task-definition.json \
  --region ap-south-1
```

---

## Step 8 — Application Load Balancer

### 8a. Create Target Group

```bash
aws elbv2 create-target-group \
  --name codesync-backend-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-029546ae99b7e44b5 \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path /actuator/health/readiness \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --matcher HttpCode=200 \
  --region ap-south-1
```

> Note the `TargetGroupArn` from the output — you need it in Step 8c and Step 9.

### 8b. Create the ALB

```bash
aws elbv2 create-load-balancer \
  --name codesync-alb \
  --subnets subnet-0ffcb0872f4dd2654 subnet-0a65e859b26c25db2 \
  --security-groups sg-0adfbe05c8a560a68 \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --region ap-south-1
```

> Note the `LoadBalancerArn` and `DNSName` from the output.

### 8c. Create Listener

```bash
aws elbv2 create-listener \
  --load-balancer-arn <LOAD_BALANCER_ARN> \
  --protocol HTTP \
  --port 80 \
  --default-actions \
    Type=forward,TargetGroupArn=<TARGET_GROUP_ARN> \
  --region ap-south-1
```

---

## Step 9 — Create the ECS Service (One-Time)

```bash
aws ecs create-service \
  --cluster codesync-cluster \
  --service-name codesync-backend-service \
  --task-definition codesync-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-0b0c9a9e7da189a4c,subnet-01e122dc6907f2738],
    securityGroups=[sg-051362f67b0ce41c1],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "
    targetGroupArn=<TARGET_GROUP_ARN>,
    containerName=codesync-backend,
    containerPort=8080
  " \
  --health-check-grace-period-seconds 90 \
  --region ap-south-1
```

> ECS tasks run in **private subnets** (no public IP). Traffic enters via the ALB which is in public subnets. This is the correct production pattern.

---

## Step 10 — Deploy a New Version

For every subsequent deployment (after the initial setup):

```bash
# 1. Build the new image
./deploy/build.sh

# 2. Push to ECR
./deploy/push.sh

# 3. Register new task revision + trigger rolling update
ECS_CLUSTER=codesync-cluster \
ECS_SERVICE=codesync-backend-service \
./deploy/deploy.sh
```

---

## Verify the Deployment

### Check service status
```bash
aws ecs describe-services \
  --cluster codesync-cluster \
  --services codesync-backend-service \
  --region ap-south-1 \
  --query 'services[0].{status:status,desired:desiredCount,running:runningCount,pending:pendingCount}'
```

### Stream CloudWatch logs
```bash
aws logs tail /ecs/codesync-backend \
  --follow \
  --region ap-south-1
```

### Health endpoint via ALB
```bash
curl http://<ALB_DNS_NAME>/actuator/health
curl http://<ALB_DNS_NAME>/actuator/health/readiness
curl http://<ALB_DNS_NAME>/actuator/health/liveness
```

Expected response:
```json
{"status": "UP"}
```

---

## Health Check Endpoints

| Endpoint | Purpose | Checked By |
|----------|---------|-----------|
| `/actuator/health` | Overall health (DB + Redis) | Manual verification |
| `/actuator/health/readiness` | Ready to serve traffic | ALB target group + ECS |
| `/actuator/health/liveness` | JVM is alive | ECS container health check |

---

## Rollback

ECS keeps previous task definition revisions. To roll back:

```bash
# List recent revisions
aws ecs list-task-definitions \
  --family-prefix codesync-backend \
  --region ap-south-1 \
  --sort DESC

# Roll back to a specific revision
aws ecs update-service \
  --cluster codesync-cluster \
  --service codesync-backend-service \
  --task-definition codesync-backend:<REVISION_NUMBER> \
  --force-new-deployment \
  --region ap-south-1
```

---

## Troubleshooting

### Task stops immediately on startup

Check the stopped task logs:
```bash
# Get stopped task ARN
aws ecs list-tasks \
  --cluster codesync-cluster \
  --desired-status STOPPED \
  --region ap-south-1

# Describe it to see the stop reason
aws ecs describe-tasks \
  --cluster codesync-cluster \
  --tasks <TASK_ARN> \
  --region ap-south-1 \
  --query 'tasks[0].{stoppedReason:stoppedReason,containers:containers[*].{name:name,reason:reason,exitCode:exitCode}}'
```

### Task fails to pull secrets

```
Error: ResourceInitializationError: unable to pull secrets
```

**Fix:** Verify `ecsTaskExecutionRole` has the `SecretsManagerReadWrite` policy and the secret ARNs in the task definition exactly match the names in Secrets Manager.

```bash
aws secretsmanager describe-secret \
  --secret-id codesync/prod/database \
  --region ap-south-1 \
  --query 'ARN'
```

### Task fails to pull image from ECR

```
Error: CannotPullContainerError
```

**Fix:** Verify the task is in a subnet with either a NAT Gateway or VPC endpoint for ECR. Private subnets without a NAT Gateway cannot reach ECR. Either add a NAT Gateway or run the service in public subnets with `assignPublicIp=ENABLED` (acceptable for dev/demo).

### ALB health check failing (target unhealthy)

1. Confirm the task is running: `aws ecs list-tasks --cluster codesync-cluster --desired-status RUNNING`
2. Confirm the security group `sg-051362f67b0ce41c1` allows inbound TCP 8080 from the ALB security group `sg-0adfbe05c8a560a68`
3. Check the actuator endpoint manually from inside the VPC

### Database connection refused

Confirm the RDS security group `sg-0b440e90735a70e8c` allows inbound TCP 5432 from the ECS security group `sg-051362f67b0ce41c1`.

---

## Security Group Rules Reference

| Direction | From | To | Port | Purpose |
|-----------|------|----|------|---------|
| Inbound | `0.0.0.0/0` | ALB `sg-0adfbe05c8a560a68` | 80, 443 | Public traffic |
| Inbound | ALB `sg-0adfbe05c8a560a68` | ECS `sg-051362f67b0ce41c1` | 8080 | ALB → App |
| Inbound | ECS `sg-051362f67b0ce41c1` | RDS `sg-0b440e90735a70e8c` | 5432 | App → DB |
| Inbound | ECS `sg-051362f67b0ce41c1` | Redis `sg-008b3a4aed68814fa` | 6379 | App → Cache |

---

## Local Development

Local dev is fully unaffected. `docker-compose.yml` spins up local Postgres + Redis.

```bash
# Start dependencies
docker-compose up -d

# Run the backend (falls back to localhost defaults automatically)
cd codesync-backend
./mvnw spring-boot:run
```

The `application.yml` uses `${DB_HOST:localhost}` syntax — when `DB_HOST` is not set in the environment, it defaults to `localhost`. No `.env` file or extra configuration needed for local development.

---

## Deployment Checklist

```
Pre-deployment (one-time)
  ☐ ecsTaskExecutionRole created with ECR + SecretsManager policies
  ☐ ecsTaskRole created
  ☐ CloudWatch log group /ecs/codesync-backend created
  ☐ create-secrets.sh filled in and executed
  ☐ All four secrets verified in Secrets Manager
  ☐ REDIS_HOST placeholder replaced in ecs-task-definition.json
  ☐ ALB target group created (health check: /actuator/health/readiness)
  ☐ ALB created and listener configured
  ☐ ECS cluster created

Each deployment
  ☐ docker build — ./deploy/build.sh
  ☐ docker push  — ./deploy/push.sh
  ☐ ECS update   — ./deploy/deploy.sh
  ☐ Service status RUNNING with 0 pending tasks
  ☐ /actuator/health/readiness returns {"status":"UP"}
  ☐ /actuator/health/liveness  returns {"status":"UP"}
  ☐ CloudWatch log stream shows "Started CodesyncBackendApplication"
  ☐ API endpoint reachable through ALB DNS name
```
