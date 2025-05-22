// apps/publisher/src/gst/pipeline.ts
/**
 * Manages the GStreamer pipeline for streaming video to AWS Kinesis Video Streams.
 *
 * - Detects a local camera source (V4L2 on Linux, DirectShow on Windows, or fallback)
 * - Configures a low-latency H.264 encoder
 * - Sends the encoded frames into a KVS stream via `kvssink`
 */

import { spawn, spawnSync, ChildProcess } from "child_process";
import os from "os";
import fs from "fs";
import { videoService } from "@streaming-app/common/aws/videoService";

let gstProc: ChildProcess | null = null;

interface AWSCreds {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

/**
 * Chooses the correct GStreamer source element for the camera:
 * - On Linux: v4l2src if /dev/video0 exists
 * - On Windows: ksvideosrc by probing gst-device-monitor-1.0
 * - Otherwise: autovideosrc (generic fallback)
 */
function pickCameraSrc(): string[] {
  if (os.platform() === "linux") {
    const dev0 = "/dev/video0";
    if (fs.existsSync(dev0)) {
      return ["v4l2src", `device=${dev0}`];
    }
  } else if (os.platform() === "win32") {
    try {
      const out = spawnSync("gst-device-monitor-1.0", ["Video/Source"], { encoding: "utf8" });
      const lines = (out.stdout as string).split("\n");
      const line = lines.find((l) => l.includes("Integrated"));
      const match = line?.match(/device=(.+?)\s/);
      if (match) {
        return ["ksvideosrc", `device=${match[1]}`];
      }
    } catch {
      // ignore any errors probing devices
    }
  }
  // Fallback for other platforms
  return ["autovideosrc"];
}

/**
 * Starts the GStreamer pipeline if not already running:
 * 1. Ensures the KVS stream exists (creates it if missing)
 * 2. Builds camera → convert → x264enc → kvssink pipeline
 * 3. Passes AWS credentials and stream name to kvssink
 * 4. Attaches exit and error handlers to reset gstProc
 *
 * @param streamName  - The name of the KVS stream (typically the user’s email)
 * @param creds       - Temporary AWS credentials from Cognito Identity Pool
 */
export async function startPipeline(
  streamName: string,
  creds: AWSCreds
) {
  // Prevent multiple pipelines
  if (gstProc) return;

  // Ensure KVS stream exists and retrieve its ARN
  await videoService.ensureStream(streamName);

  // Select appropriate camera source element
  const cameraSrc = pickCameraSrc();

  // Compose GStreamer arguments
  const args = [
    ...cameraSrc,
    "!", `video/x-raw,width=854,height=480`,
    "!", "videoconvert",
    "!", "x264enc", "tune=zerolatency",
    "!", "kvssink",
    `stream-name=${streamName}`,
    `access-key=${creds.accessKeyId}`,
    `secret-key=${creds.secretAccessKey}`,
    `session-token=${creds.sessionToken}`,
    `aws-region=${process.env.AWS_REGION}`
  ];

  // Spawn the gst-launch-1.0 process
  gstProc = spawn("gst-launch-1.0", args, { stdio: "inherit" });

  // Reset gstProc on exit
  gstProc.on("exit", (code) => {
    console.log(`GStreamer exited with code ${code}`);
    gstProc = null;
  });

  // Log and reset on error
  gstProc.on("error", (err) => {
    console.error("Failed to start GStreamer:", err);
    gstProc = null;
  });
}

/**
 * Stops the running GStreamer pipeline by sending SIGINT
 */
export function stopPipeline() {
  if (!gstProc) return;
  gstProc.kill("SIGINT");
  gstProc = null;
}
