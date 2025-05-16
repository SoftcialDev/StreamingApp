/**
 * services/streams.service.ts
 * Business logic for stream orchestration.
 */

import { deleteStream, ensureStream } from "../clients/aws.client";
import { getHlsUrl }     from "../clients/aws.client";
import { redisClient }   from "../clients/redis.client";

export async function registerStream(employeeId: string): Promise<string> {
  // Create or retrieve the KVS stream ARN
  const streamArn = await ensureStream(employeeId);

  // Persist mapping and mark online
  await redisClient.setStream(employeeId, employeeId);
  await redisClient.markOnline(employeeId);

  return streamArn;
}

export async function unregisterStream(employeeId: string): Promise<void> {
  // look up its ARN
  const streamName = employeeId;
  const streamArn = await redisClient.getStream(streamName);
  if (streamArn) {
    // delete from AWS
    await deleteStream(streamArn);
  }
  // remove from Redis
  await redisClient.markOffline(employeeId);
}

export async function listOnlineStreams(): Promise<Array<{ employeeId: string; hlsUrl: string }>> {
  const employeeIds = await redisClient.listOnline();
  return Promise.all(
    employeeIds.map(async (id) => ({
      employeeId: id,
      hlsUrl: await getHlsUrl(id)
    }))
  );
}
