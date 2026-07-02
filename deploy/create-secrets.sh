#!/usr/bin/env bash
# =============================================================================
# create-secrets.sh — Create all Secrets Manager secrets for CodeSync
#
# Run this ONCE before the first deployment.
# Safe to re-run — uses put-secret-value if secret already exists.
#
# Secrets created:
#   codesync/prod/database  → DB_USERNAME, DB_PASSWORD
#   codesync/prod/security  → JWT_SECRET
#   codesync/prod/oauth     → GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
#                             GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
#   codesync/prod/openai    → OPENAI_API_KEY
#
# Why separate secrets?
#   - Least-privilege: services can be granted access to only what they need
#   - Rotation: DB credentials can be rotated independently of OAuth secrets
#   - Auditability: CloudTrail shows which secret was accessed
#
# Usage:
#   chmod +x deploy/create-secrets.sh
#   ./deploy/create-secrets.sh
# =============================================================================

set -euo pipefail

REGION="ap-south-1"

# ── Fill in your values ───────────────────────────────────────────────────────
DB_USERNAME="<YOUR_RDS_USERNAME>"
DB_PASSWORD="<YOUR_RDS_PASSWORD>"

# Generate a strong JWT secret with: openssl rand -hex 64
JWT_SECRET="<YOUR_JWT_SECRET>"

GOOGLE_CLIENT_ID="<YOUR_GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<YOUR_GOOGLE_CLIENT_SECRET>"

GITHUB_CLIENT_ID="<YOUR_GITHUB_CLIENT_ID>"
GITHUB_CLIENT_SECRET="<YOUR_GITHUB_CLIENT_SECRET>"

OPENAI_API_KEY="<YOUR_OPENAI_API_KEY>"
# ─────────────────────────────────────────────────────────────────────────────

upsert_secret() {
  local name="$1"
  local value="$2"
  local description="$3"

  if aws secretsmanager describe-secret \
      --secret-id "$name" \
      --region "$REGION" &>/dev/null; then
    echo "  Updating : $name"
    aws secretsmanager put-secret-value \
      --secret-id "$name" \
      --secret-string "$value" \
      --region "$REGION" \
      --output text > /dev/null
  else
    echo "  Creating : $name"
    aws secretsmanager create-secret \
      --name "$name" \
      --description "$description" \
      --secret-string "$value" \
      --region "$REGION" \
      --output text > /dev/null
  fi
}

echo "Creating/updating secrets in $REGION..."
echo ""

# 1. Database credentials
upsert_secret \
  "codesync/prod/database" \
  "{\"DB_USERNAME\":\"$DB_USERNAME\",\"DB_PASSWORD\":\"$DB_PASSWORD\"}" \
  "CodeSync production database credentials"

# 2. Security (JWT)
upsert_secret \
  "codesync/prod/security" \
  "{\"JWT_SECRET\":\"$JWT_SECRET\"}" \
  "CodeSync production JWT signing secret"

# 3. OAuth2 credentials
upsert_secret \
  "codesync/prod/oauth" \
  "{\"GOOGLE_CLIENT_ID\":\"$GOOGLE_CLIENT_ID\",\"GOOGLE_CLIENT_SECRET\":\"$GOOGLE_CLIENT_SECRET\",\"GITHUB_CLIENT_ID\":\"$GITHUB_CLIENT_ID\",\"GITHUB_CLIENT_SECRET\":\"$GITHUB_CLIENT_SECRET\"}" \
  "CodeSync production OAuth2 client credentials"

# 4. OpenAI
upsert_secret \
  "codesync/prod/openai" \
  "{\"OPENAI_API_KEY\":\"$OPENAI_API_KEY\"}" \
  "CodeSync production OpenAI API key"

echo ""
echo "All secrets created/updated."
echo ""
echo "Verify:"
echo "  aws secretsmanager list-secrets --region $REGION \\"
echo "    --query 'SecretList[?starts_with(Name, \`codesync/prod\`)].Name'"
