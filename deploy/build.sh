#!/usr/bin/env bash
# =============================================================================
# build.sh — Build the CodeSync backend Docker image locally
#
# Responsibility: Build only. Does not push to ECR.
# Run from the repository root or the deploy/ directory.
#
# Usage:
#   ./deploy/build.sh
#   IMAGE_TAG=v1.2.0 ./deploy/build.sh
# =============================================================================

set -euo pipefail

IMAGE_NAME="codesync-backend"
IMAGE_TAG="${IMAGE_TAG:-latest}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../codesync-backend" && pwd)"

echo "Building Docker image..."
echo "  Context : $BACKEND_DIR"
echo "  Tag     : $IMAGE_NAME:$IMAGE_TAG"
echo ""

docker build \
  --tag "$IMAGE_NAME:$IMAGE_TAG" \
  "$BACKEND_DIR"

echo ""
echo "Build complete: $IMAGE_NAME:$IMAGE_TAG"
echo "Image size:"
docker image inspect "$IMAGE_NAME:$IMAGE_TAG" \
  --format '  {{.Size | printf "%.0f" | printf "%d bytes"}}' 2>/dev/null || \
  docker images "$IMAGE_NAME:$IMAGE_TAG" --format "  {{.Size}}"
