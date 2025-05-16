#!/usr/bin/env bash
# Builds the Electron app and publishes installer artifacts to S3.

set -e

# 1) Build TypeScript
npm run build

# 2) Package with electron-builder
electron-builder --publish=always

# 3) Upload to S3 (electron-builder can do this automatically if configured)
 aws s3 sync dist/gha s3://streaming-app-installers-bucket/releases/latest/ --delete

echo "✅ Build and publish complete"
