/**
 * Centralized logging for the Publisher app.
 * Writes to console and optionally to a file.
 */
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

const logFile = path.join(app.getPath("userData"), "publisher.log");

/** Append a message to both console and log file */
export function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(logFile, line + "\n", { encoding: "utf8" });
}

/** Log an error */
export function error(message: string, err?: Error) {
  log(`ERROR: ${message}${err ? ` - ${err.stack || err.message}` : ""}`);
}
