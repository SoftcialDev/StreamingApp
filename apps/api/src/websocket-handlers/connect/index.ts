// apps/api/src/websocket-handlers/connect/index.ts

import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayEventRequestContextV2
} from "aws-lambda";
import { ddb, CONNECTIONS_TABLE } from "../common";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

/**
 * We know API Gateway will invoke this route with a WebSocket context,
 * where `requestContext.connectionId` is present. The built-in V2 type
 * is missing it, so we extend it here.
 */
interface WebSocketRequestContext extends APIGatewayEventRequestContextV2 {
  connectionId: string;
}

/**
 * We also know the rest of the event matches APIGatewayProxyEventV2,
 * but with our specialized requestContext.
 */
interface WebSocketEvent extends Omit<APIGatewayProxyEventV2, "requestContext"> {
  requestContext: WebSocketRequestContext;
}

/**
 * On WebSocket $connect, store the mapping from email→connectionId.
 * Expects the client to connect with: wss://.../prod?email=foo@bar.com
 */
export async function connectHandler(
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> {
  // 1. Pull the connectionId out of the context
  const connectionId = event.requestContext.connectionId;

  // 2. Read the email from the query string
  const qs = event.queryStringParameters || {};
  const email = qs.email;
  if (!email) {
    return { statusCode: 400, body: "Missing email query parameter" };
  }

  // 3. Persist into DynamoDB
  await ddb.send(
    new PutItemCommand({
      TableName: CONNECTIONS_TABLE,
      Item: {
        email: { S: email },
        connectionId: { S: connectionId }
      }
    })
  );

  return { statusCode: 200, body: "Connected" };
}
