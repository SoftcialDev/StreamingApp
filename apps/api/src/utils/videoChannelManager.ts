// apps/api/src/utils/videoChannelManager.ts
import {
  KinesisVideoClient,
  CreateSignalingChannelCommand,
  DeleteSignalingChannelCommand,
  DescribeSignalingChannelCommand,
} from "@aws-sdk/client-kinesis-video";
import dotenv from "dotenv";
dotenv.config();

const region = process.env.AWS_REGION!;
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};
const kvClient = new KinesisVideoClient({ region, credentials });

/**
 * Crea un canal SINGLE_MASTER en KVS, o devuelve el ARN si ya existe.
 */
export async function ensureChannel(channelName: string): Promise<string> {
  try {
    const res = await kvClient.send(
      new CreateSignalingChannelCommand({
        ChannelName: channelName,
        ChannelType: "SINGLE_MASTER",
      })
    );
    return res.ChannelARN!;
  } catch (err: any) {
    if (err.name === "ResourceInUseException") {
      // El canal ya existe, lo consultamos
      const desc = await kvClient.send(
        new DescribeSignalingChannelCommand({ ChannelName: channelName })
      );
      return desc.ChannelInfo!.ChannelARN!;
    }
    throw err;
  }
}

/**
 * Borra un canal existente en KVS.
 */
export async function deleteChannel(channelArn: string): Promise<void> {
  await kvClient.send(
    new DeleteSignalingChannelCommand({ ChannelARN: channelArn })
  );
}
