````markdown
# Electron Publisher App

A headless Electron application that runs as a background service on Windows and Linux. It listens for remote “punch-in” and “punch-out” commands over a WebSocket connection, then starts or stops a GStreamer pipeline to stream 480p video from the local camera into AWS Kinesis Video Streams under the user’s corporate email as the stream name. It also includes automatic in-place updates from an S3 bucket.

---

## Features

- **Initial Email Login**  
  Prompts once for the employee’s corporate email (Microsoft 365). Stores it securely for subsequent runs.

- **AWS Credentialing**  
  Uses an unauthenticated Cognito Identity Pool to fetch temporary AWS credentials for GStreamer’s `kvssink`.

- **WebSocket Command Channel**  
  Maintains a persistent WebSocket to the API Gateway.  
  - `in` → start streaming  
  - `out` → stop streaming  
  - Uses the API’s `$disconnect` hook to detect unexpected disconnects and clean up.

- **GStreamer Pipeline**  
  Spawns `gst-launch-1.0` with `kvssink`, fixed to 480×{{height}} resolution, optimized for low-latency corporate streaming.

- **Auto-Updates via S3**  
  Integrates `electron-updater` with your `streaming-app-installers-bucket`. On launch and periodically, checks an S3 release feed and installs updates automatically.

- **Headless Operation**  
  After the initial login prompt, runs entirely in the background (system tray or service) with no further UI.

---

## Installation

1. **Download the installer** for Windows or Linux from your S3 bucket or corporate download page.
2. **Run the installer** and complete setup.
3. On first launch, **enter your corporate email** when prompted.
4. The app will start automatically on system boot and wait for commands.

---

## Configuration

All configurable values are set at build time via environment variables or embedded in the installer:

```env
AWS_REGION=us-east-1
COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
API_WS_URL=wss://api.yourdomain.com/prod
GSTREAMER_WIDTH=854
GSTREAMER_HEIGHT=480
S3_UPDATE_BUCKET=streaming-app-installers-bucket
````

---

## Usage

* **Punch In**
  Your external system calls the API to publish an `"in"` command for your email → the app starts streaming.

* **Punch Out**
  A corresponding `"out"` command stops the GStreamer pipeline gracefully.

* **Unexpected Shutdown**
  If the app or network disconnects, the WebSocket `$disconnect` event triggers a cleanup punch-out.

---

## Development

1. Clone the repo and navigate to `apps/publisher`.
2. Install dependencies:

   ```bash
   npm install
   ```
3. Run in development mode:

   ```bash
   npm run start
   ```
4. Build for production:

   ```bash
   npm run build
   npm run dist
   ```

---

## Troubleshooting

* **No audio/video**
  Ensure GStreamer with the `kvssink` plugin is installed on your system and accessible in `PATH`.

* **WebSocket errors**
  Verify `API_WS_URL` is correct and reachable, and that your network allows WSS traffic.

* **Auto-update failures**
  Check that the S3 bucket and release metadata (`latest.yml`) are public or IAM-accessible by the app.

---

