# StreamingApp Monorepo

This repository contains three applications and a shared library:

- **`apps/api`**: Backend REST & WebSocket API for authentication, stream registration, and punch-in/out events.  
- **`apps/publisher`**: Electron desktop app that captures local camera, authenticates via Cognito Hosted UI (Microsoft 365), and streams video to AWS Kinesis Video Streams based on remote punch commands.  
- **`apps/web`**: React + Tailwind single-page app for admins to view live HLS feeds and open Microsoft Teams chats per publisher.  
- **`packages/common`**: Shared TypeScript utilities for AWS clients (Cognito, KVS, HLS, Redis), JWT verification, and more.

---

## Architecture & AWS Resources

1. **Cognito**  
   - **User Pool** with Microsoft 365 identity provider (Hosted UI) for admins.  
   - **Identity Pool** (unauthenticated) to exchange tokens for AWS credentials in the publisher.  
2. **API Gateway**  
   - **REST** endpoints (`/auth`, `/streams/register`, `/streams/online`, `/streams/unregister`).  
   - **WebSocket** routes (`$connect`, `$disconnect`, `in`, `out`) for the publisher’s punch channel.  
3. **Lambda Functions**  
   - **WebSocket handlers** (connect/disconnect) store/manage connection IDs in DynamoDB and trigger punch-out cleanup.  
   - **Auth & Streams** controllers in `apps/api` handle REST logic, backed by KVS and Redis.  
4. **DynamoDB**  
   - Table **`WebSocketConnections`** for mapping `email ↔ connectionId`.  
5. **Kinesis Video Streams** (us-east-1)  
   - Dynamically created per publisher (stream name = user’s email).  
6. **ElastiCache (Redis)**  
   - Optional session store for online/offline TTL as backup to DynamoDB.  
7. **S3**  
   - Bucket **`streaming-app-installers-bucket`** for Electron auto-updates via `electron-updater`.  
8. **CloudWatch**  
   - Log groups & alarms for all Lambdas and API Gateway errors.

---

## Getting Started

1. **Install dependencies**  
   ```bash
   npm install
   cd apps/api && npm install
   cd ../publisher && npm install
   cd ../web && npm install

2. **Configure AWS resources** (via AWS CLI / CloudFormation): Cognito pools, API Gateway, DynamoDB, KVS, Redis, S3.
3. **Environment**

   * Copy `.env.example` in each app and fill in your AWS region, Cognito IDs, API URLs, S3 bucket names, etc.
4. **Develop**

   * **API**: `cd apps/api && npm run dev`
   * **Publisher**: `cd apps/publisher && npm run start`
   * **Web**: `cd apps/web && npm run dev`
5. **Build & Deploy**

   * **API** Docker or Serverless deploy of `apps/api`.
   * **Publisher**: `apps/publisher/scripts/build-installer.sh`.
   * **Web**: Build static and serve from S3, CloudFront, or your API layer.

## Monorepo Tooling

* **Turbo** for task orchestration (`turbo.json`).
* **TypeScript project references** across `packages/common` and the apps.
* **Jest** & **aws-sdk-client-mock** for unit & integration tests under `apps/api/integration-test`.

