/**
 * KinesisVideoService: typed client for managing Kinesis Video Streams (KVS).
 *
 * This module exports both a singleton service for production use and the
 * KinesisVideoService class for injecting a mock client in tests.
 *
 * Behavior differs by NODE_ENV:
 * - In 'test', the default client is not instantiated, allowing tests to provide a mock.
 * - In other environments, a real KinesisVideoClient is created and used.
 */

import {
  KinesisVideoClient,
  CreateStreamCommand,
  DeleteStreamCommand,
  DescribeStreamCommand,
} from "@aws-sdk/client-kinesis-video";
import dotenv from "dotenv";

dotenv.config();

// Build AWS configuration from environment
const region = process.env.AWS_REGION || "us-east-1";

// Instantiate real client only in non-test environments
let kvClient: KinesisVideoClient;
if (process.env.NODE_ENV !== "test") {
  kvClient = new KinesisVideoClient({ region });
} else {
  // Placeholder for injection in tests
  kvClient = undefined as any;
}

/**
 * Service class for managing KVS streams.
 */
export class KinesisVideoService {
  constructor(private readonly client: KinesisVideoClient = kvClient) {}

  /**
   * Ensure a KVS stream exists; if not, create it.
   * @param streamName - human-readable stream name
   * @returns the Stream ARN
   */
  async ensureStream(streamName: string): Promise<string> {
    try {
      const desc = await this.client.send(
        new DescribeStreamCommand({ StreamName: streamName })
      );
      return desc.StreamInfo!.StreamARN!;
    } catch (err: any) {
      // If stream does not exist, create it
      if (err.name === "ResourceNotFoundException") {
        const create = await this.client.send(
          new CreateStreamCommand({
            StreamName: streamName,
            MediaType: "video/h264",
          })
        );
        return create.StreamARN!;
      }
      throw err;
    }
  }

  /**
   * Delete a KVS stream by ARN, retrieving version if not provided.
   * @param streamArn - full ARN of the stream
   * @param version - optional CurrentVersion guard
   */
  async deleteStream(streamArn: string, version?: string): Promise<void> {
    let currentVersion = version;
    if (!currentVersion) {
      const desc = await this.client.send(
        new DescribeStreamCommand({ StreamARN: streamArn })
      );
      currentVersion = desc.StreamInfo?.Version;
    }

    await this.client.send(
      new DeleteStreamCommand({
        StreamARN: streamArn,
        ...(currentVersion ? { CurrentVersion: currentVersion } : {}),
      })
    );
  }
}

/**
 * Default singleton instance for production use.
 * In tests, import KinesisVideoService and provide a mock KinesisVideoClient.
 */
export const videoService = new KinesisVideoService();
