#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Register a new ECS task definition revision and update the service
#
# Responsibility: Register task definition + update service. Does not build
# or push images. Run build.sh and push.sh first.
#
# Prerequisites:
#   - Image already pushed to ECR (run build.sh then push.sh)
#   - Secrets already created in Secrets Manager (run create-secrets.sh once)
#   - ECS cluster and service already exist
#   - CloudWatch log group /ecs/codesync-backend already created
#
# Usage:
#   ECS_CLUSTER=codesync-cluster ECS_SERVICE=codesync-backend-service ./deploy/deploy.sh
# =============================================================================

set -euo pipefail

AWS_REGION="ap-south-1"
ECS_CLUSTER="${ECS_CLUSTER:?Set ECS_CLUSTER. Example: ECS_CLUSTER=codesync-cluster ./deploy/deploy.sh}"
ECS_SERVICE="${ECS_SERVICE:?Set ECS_SERVICE. Example: ECS_SERVICE=codesync-backend-service ./deploy/deploy.sh}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASK_DEF_FILE="$SCRIPT_DIR/ecs-task-definition.json"

echo "=== CodeSync ECS Deploy ==="
echo "  Cluster : $ECS_CLUSTER"
echo "  Service : $ECS_SERVICE"
echo "  Region  : $AWS_REGION"
echo ""

# ── Step 1: Register new task definition revision ─────────────────────────────
echo "[1/2] Registering task definition..."
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "file://$TASK_DEF_FILE" \
  --region "$AWS_REGION" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)
echo "  Registered: $TASK_DEF_ARN"
echo ""

# ── Step 2: Update service to use the new revision ───────────────────────────
echo "[2/2] Updating ECS service..."
aws ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --task-definition "$TASK_DEF_ARN" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --output json | \
  python3 -c "
import json, sys
svc = json.load(sys.stdin)['service']
print(f'  Status          : {svc[\"status\"]}')
print(f'  Desired count   : {svc[\"desiredCount\"]}')
print(f'  Running count   : {svc[\"runningCount\"]}')
print(f'  Task definition : {svc[\"taskDefinition\"]}')
" 2>/dev/null || echo "  Service update triggered."

echo ""
echo "=== Deployment triggered ==="
echo ""
echo "Monitor:"
echo "  aws ecs describe-services \\"
echo "    --cluster $ECS_CLUSTER --services $ECS_SERVICE \\"
echo "    --region $AWS_REGION \\"
echo "    --query 'services[0].deployments'"
echo ""
echo "Logs:"
echo "  aws logs tail /ecs/codesync-backend --follow --region $AWS_REGION"
