# Electron Publisher

A headless Electron app that:

1. **Authenticates** via Cognito Hosted UI (Microsoft 365).  
2. **Exchanges** the Access Token for AWS credentials (Identity Pool).  
3. **Opens** a WebSocket channel to receive `in`/`out` commands.  
4. **Launches** a GStreamer pipeline (`kvssink`) to stream local camera (480p) to AWS KVS.  
5. **Auto-updates** itself from S3 via `electron-updater`.

### 📁 Structure

apps/publisher/
├── public/             # index.html → Hosted UI, callback.html for redirect
├── src/
│   ├── auth/           # Cognito config & token exchange
│   ├── gst/            # GStreamer pipeline launcher
│   ├── ws/             # WebSocket client
│   ├── store/          # electron-store for prefs (token, email)
│   ├── util/           # Logging
│   ├── main.ts         # Electron entrypoint & IPC
│   └── preload.ts      # Safe IPC bridge
├── scripts/            # build-installer.sh
└── tsconfig.json


### ⚙️ Prerequisites

- AWS resources configured (Cognito, KVS, WS API, DynamoDB, S3).  
- GStreamer 1.x with `kvssink` plugin installed.  
- `.env` with:
 env
  COGNITO_DOMAIN=...
  COGNITO_CLIENT_ID=...
  COGNITO_IDENTITY_POOL_ID=...
  REDIRECT_URI=file://.../public/callback.html
  API_WS_URL=wss://...execute-api...
  AWS_REGION=us-east-1
  S3_UPDATE_BUCKET=streaming-app-installers-bucket

### 🚀 Running

```bash
cd apps/publisher
npm install
npm run start       # opens login window
npm run dist        # builds & publishes installer
```
