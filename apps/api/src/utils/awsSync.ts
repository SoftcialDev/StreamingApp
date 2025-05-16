// apps/api/src/utils/awsSync.ts
import {
  KinesisVideoClient,
  ListSignalingChannelsCommand,
  ListSignalingChannelsCommandOutput,
  DescribeSignalingChannelCommand,
} from "@aws-sdk/client-kinesis-video";
import { redis } from "./redisClient";
import { deleteChannel } from "./videoChannelManager";
import dotenv from "dotenv";
dotenv.config();

const client = new KinesisVideoClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Reconcile Redis ⇄ AWS Signaling Channels
export async function reconcileChannels(): Promise<void> {
  // 1) Recuperar lista de nombres de canales de AWS
  const awsList: string[] = [];
  let nextToken: string | undefined = undefined;

  do {
    const output: ListSignalingChannelsCommandOutput = await client.send(
      new ListSignalingChannelsCommand({ NextToken: nextToken })
    );
    const infos = output.ChannelInfoList ?? [];
    for (const info of infos) {
      if (info.ChannelName) {
        awsList.push(info.ChannelName);
      }
    }
    nextToken = output.NextToken;
  } while (nextToken);

  // 2) Claves en Redis
  const redisKeys: string[] = await redis.hkeys("stream_channels");

  // 3) Añadir a Redis los canales que AWS tiene y faltan en Redis
  for (const name of awsList) {
    if (!redisKeys.includes(name)) {
      // Obtener el ARN con DescribeSignalingChannel
      const descOutput = await client.send(
        new DescribeSignalingChannelCommand({ ChannelName: name })
      );
      const arn = descOutput.ChannelInfo?.ChannelARN;
      if (arn) {
        await redis.hset("stream_channels", name, arn);
        console.log(`[SYNC] Added Redis entry for AWS channel "${name}"`);
      }
    }
  }

  // 4) Eliminar de Redis y AWS los canales que están en Redis pero no en AWS
  for (const key of redisKeys) {
    if (!awsList.includes(key)) {
      const arn = await redis.hget("stream_channels", key);
      if (arn) {
        // Borrar en AWS
        await deleteChannel(arn);
      }
      await redis.hdel("stream_channels", key);
      console.log(`[SYNC] Removed orphan channel "${key}" from Redis${arn ? " and AWS" : ""}`);
    }
  }
}
