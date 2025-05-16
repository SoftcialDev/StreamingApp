import {
  KinesisVideoClient,
  DescribeSignalingChannelCommand,
  GetSignalingChannelEndpointCommand,
} from "@aws-sdk/client-kinesis-video";
import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand,
} from "@aws-sdk/client-kinesis-video-signaling";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { URL, URLSearchParams } from "url";
import dotenv from "dotenv";
dotenv.config();

const region = process.env.AWS_REGION!;
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

/**
 * Devuelve: { channelARN, wssSignedUrl, iceServers }
 * Role: "VIEWER" o "MASTER"
 * clientId: para que AWS enrute ICE/SDP a ese cliente
 */
export async function getSignalingInfo(
  channelName: string,
  role: "VIEWER" | "MASTER",
  clientId: string
) {
  // 1) Describe channel
  const kv = new KinesisVideoClient({ region, credentials });
  const desc = await kv.send(
    new DescribeSignalingChannelCommand({ ChannelName: channelName })
  );
  const arn = desc.ChannelInfo!.ChannelARN!;

  // 2) Endpoints WSS+HTTPS
  const { ResourceEndpointList } = await kv.send(
    new GetSignalingChannelEndpointCommand({
      ChannelARN: arn,
      SingleMasterChannelEndpointConfiguration: {
        Protocols: ["WSS", "HTTPS"],
        Role: role,
      },
    })
  );
  const wssEndpoint = ResourceEndpointList!.find(e => e.Protocol === "WSS")!.ResourceEndpoint!;
  const httpsEndpoint = ResourceEndpointList!.find(e => e.Protocol === "HTTPS")!.ResourceEndpoint!;

  // 3) ICE servers
  const sig = new KinesisVideoSignalingClient({ region, endpoint: httpsEndpoint, credentials });
  const iceRes = await sig.send(new GetIceServerConfigCommand({ ChannelARN: arn }));
  const iceServers = [
    { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` },
    ...iceRes.IceServerList!.flatMap(s =>
      s.Uris!.map(u => ({ urls: u, username: s.Username!, credential: s.Password! }))
    ),
  ];

  // 4) Presign WSS URL inyectando clientId
  const signer = new SignatureV4({ region, service: "kinesisvideo", credentials, sha256: Sha256 });
  const parsed = new URL(wssEndpoint);
  const presignReq = new HttpRequest({
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    path: parsed.pathname,
    method: "GET",
    query: { "X-Amz-ClientId": clientId },
  });
  const signed = await signer.presign(presignReq, { expiresIn: 900 });
  const params = new URLSearchParams(signed.query as Record<string,string>);
  const wssSignedUrl = `${wssEndpoint}?${params.toString()}`;

  return { channelARN: arn, wssSignedUrl, iceServers };
}
