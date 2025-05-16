// packages/common/src/aws/hls.ts
import {
  KinesisVideoArchivedMediaClient,
  GetHLSStreamingSessionURLCommand
} from "@aws-sdk/client-kinesis-video-archived-media";
import dotenv from "dotenv";
dotenv.config();

const archivedMedia = new KinesisVideoArchivedMediaClient({ region: process.env.AWS_REGION });

/**
 * Generate a LIVE HLS URL at 480p for the given stream.
 */
export async function getHlsUrl(streamName: string): Promise<string> {
  const cmd = new GetHLSStreamingSessionURLCommand({
    StreamName: streamName,
    PlaybackMode: "LIVE",                
    ContainerFormat: "FRAGMENTED_MP4",
    DiscontinuityMode: "ALWAYS",
    Expires: 300
  });
  const res = await archivedMedia.send(cmd);
  return res.HLSStreamingSessionURL!;
}
