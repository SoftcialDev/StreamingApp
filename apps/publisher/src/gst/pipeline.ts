// apps/publisher/src/gst/pipeline.ts

import { spawn, spawnSync, ChildProcess } from "child_process";
import os from "os";
import fs from "fs";
import { videoService } from "@streaming-app/common/src/aws/videoService";

let gstProc: ChildProcess | null = null;

interface AWSCreds {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

function pickCameraSrc(): string[] {
  if (os.platform() === "linux") {
    const dev0 = "/dev/video0";
    if (fs.existsSync(dev0)) {
      return ["v4l2src", `device=${dev0}`];
    }
  } else if (os.platform() === "win32") {
    try {
      // List video sources
      const out = spawnSync("gst-device-monitor-1.0", ["Video/Source"], { encoding: "utf8" });
      const stdout: string = out.stdout as string;
      const lines: string[] = stdout.split("\n");
      const line = lines.find((l: string) => l.includes("Integrated"));
      const match = line?.match(/device=(.+?)\s/);
      if (match) {
        return ["ksvideosrc", `device=${match[1]}`];
      }
    } catch {
      // ignore errors
    }
  }
  return ["autovideosrc"];
}

export async function startPipeline(
  streamName: string,
  creds: AWSCreds
) {
  if (gstProc) return;

  await videoService.ensureStream(streamName);

  const cameraSrc = pickCameraSrc();
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

  gstProc = spawn("gst-launch-1.0", args, { stdio: "inherit" });

  gstProc.on("exit", (code) => {
    console.log(`GStreamer exited with code ${code}`);
    gstProc = null;
  });

  gstProc.on("error", (err) => {
    console.error("Failed to start GStreamer:", err);
    gstProc = null;
  });
}

export function stopPipeline() {
  if (!gstProc) return;
  gstProc.kill("SIGINT");
  gstProc = null;
}
