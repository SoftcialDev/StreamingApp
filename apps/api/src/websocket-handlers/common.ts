// apps/api/src/websocket-handlers/common.ts

import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
export const CONNECTIONS_TABLE = process.env.WS_CONNECTIONS_TABLE!; // e.g. "WebSocketConnections"
const API_ID = process.env.WS_API_ID!; // Your WebSocket API ID
const STAGE = process.env.WS_STAGE || "prod";

export const ddb = new DynamoDBClient({ region: REGION });
export const apiGw = new ApiGatewayManagementApiClient({
  region: REGION,
  endpoint: `https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}`
});

/** Helper to send a JSON message to a given connection ID */
export async function sendToConnection(
  connectionId: string,
  payload: unknown
) {
  const cmd = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: Buffer.from(JSON.stringify(payload)),
  });
  await apiGw.send(cmd);
}
