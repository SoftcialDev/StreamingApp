# API Service

This is the backend service for StreamingApp. It exposes:

- **REST**  
  - `POST /auth/login` (Microsoft 365 via Cognito)  
  - `POST /streams/register` (create/verify KVS stream)  
  - `GET  /streams/online`  (list online streams + HLS URLs)  
  - `POST /streams/unregister` (delete stream + mark offline)  
- **WebSocket**  
  - `$connect` & `$disconnect` (store/cleanup connection IDs)  
  - `in` & `out` routes for punch-in/punch-out commands.

### 📁 Structure

apps/api/
├── src/
│   ├── controllers/      # Express handlers
│   ├── services/         # Business logic
│   ├── routes/           # Express + WS route definitions
│   ├── websocket-handlers/  # Lambda connect/disconnect
│   └── utils/            # Logging, response helpers
├── integration-test/     # End-to-end tests with Supertest
└── scripts/              # Deployment helpers

### 🛠️ Setup & Run

1. Copy `.env.example` → `.env` with your AWS and Cognito values.  
2. `npm install`  
3. `npm run dev` (starts Express & WS on `localhost:4000`)  
4. `npm run build && npm start` for production build.

### 🔗 AWS Integration

- **Environment Variables**  
  - `WS_CONNECTIONS_TABLE` – DynamoDB table for WebSocket connection mappings.  
  - `WS_API_ID`         – API Gateway WebSocket API ID.  
  - `WS_STAGE`          – WebSocket stage (e.g. `prod`).  
  - `PUNCH_EVENTS_QUEUE_URL` – SQS queue URL for buffering punch events.  
  - `API_BASE_URL`      – Public REST API base URL.

- **Lambda Handlers** (in `src/websocket-handlers/`):  
  1. **`connectHandler`** (`$connect`)  
     - Runs when a client opens the WebSocket.  
     - Stores `{ email, connectionId }` in DynamoDB so you know which sockets are live.  
  2. **`disconnectHandler`** (`$disconnect`)  
     - Runs when a client disconnects.  
     - Deletes those mappings and calls `POST /streams/unregister` to clean up the KVS pipeline.  
  3. **`punchHandler`** (`in` / `out`)  
     - Enqueues incoming punch‐in/punch‐out commands (`{ email, action }`) into the SQS queue for durability.  
  4. **`consumer`** (SQS‐triggered)  
     - Automatically invoked by new SQS messages.  
     - Queries DynamoDB for all active `connectionId`s for that `email` and pushes `{ action }` down each via the API Gateway Management API.  
     - Deletes the SQS message on success.

- **Deploy Steps**  
  1. **Build & ZIP** each handler (connect, disconnect, punch, consumer).  
  2. **Create or Update** the four Lambdas via `aws lambda create-function` / `update-function-code`, passing the ZIP and the required environment variables.  
  3. **Wire WS Routes** in API Gateway: map `$connect`, `$disconnect`, `in`, and `out` routes to their respective Lambdas.  
  4. **Event Source Mapping**: bind `PunchEventConsumer` to your `PunchEventsQueue` so it triggers automatically.  
  5. **Test** end-to-end: verify WebSocket connect/disconnect behavior, that punch events enqueue in SQS, and are delivered in real-time to connected clients.  
