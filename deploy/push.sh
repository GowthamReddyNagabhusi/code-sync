#!/usr/bin/env bash
# =============================================================================
# push.sh — Tag and push the local image to Amazon ECR
#
# Responsibility: ECR login, tag, and push. Does not build.
# Run build.sh first.
#
# Prerequisites:
#   - docker build has been run (codesync-backend:latest exists locally)
#   - AWS CLI configured with credentials for ap-south-1
#
# Usage:
#   ./deploy/push.sh
#   IMAGE_TAG=v1.2.0 ./deploy/push.sh
# =============================================================================

set -euo pipefail

AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID="649424354235"
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
ECR_REPO="codesync"
IMAGE_TAG="${IMAGE_TAG:-latest}"

LOCAL_IMAGE="codesync-backend:$IMAGE_TAG"
REMOTE_IMAGE="$ECR_REGISTRY/$ECR_REPO:$IMAGE_TAG"

# Verify the local image exists
if ! docker image inspect "$LOCAL_IMAGE" &>/dev/null; then
  echo "Error: local image '$LOCAL_IMAGE' not found."
  echo "Run ./deploy/build.sh first."
  exit 1
fi

echo "Authenticating with ECR..."
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"
echo "Login successful."
echo ""

echo "Tagging image..."
echo "  $LOCAL_IMAGE  →  $REMOTE_IMAGE"
docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"
echo ""

echo "Pushing to ECR (this may take a few minutes)..."
docker push "$REMOTE_IMAGE"
echo ""
echo "Push complete: $REMOTE_IMAGE"
