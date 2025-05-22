import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayEventRequestContextV2
} from "aws-lambda";
import { ddb, CONNECTIONS_TABLE } from "../common";
import {
  ScanCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import fetch from "node-fetch";

/** Same context extension as in connectHandler. */
interface WebSocketRequestContext extends APIGatewayEventRequestContextV2 {
  connectionId: string;
}
interface WebSocketEvent extends Omit<APIGatewayProxyEventV2, "requestContext"> {
  requestContext: WebSocketRequestContext;
}

/**
 * On WebSocket $disconnect:
 * 1. Scans DynamoDB for any entries with this connectionId
 * 2. Deletes each mapping { email, connectionId }
 * 3. Calls REST `/streams/unregister` to mark the stream offline
 */
export async function disconnectHandler(
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> {
  const { connectionId } = event.requestContext;

  // 1) Find all mappings for this connection
  const scanRes = await ddb.send(new ScanCommand({
    TableName: CONNECTIONS_TABLE,
    FilterExpression: "connectionId = :cid",
    ExpressionAttributeValues: {
      ":cid": { S: connectionId }
    }
  }));
  const items = scanRes.Items ?? [];
  if (!items.length) {
    return { statusCode: 200, body: "No mapping found" };
  }

  // 2 & 3) Delete mappings and notify API
  await Promise.all(items.map(async item => {
    const email = item.email.S!;
    await ddb.send(new DeleteItemCommand({
      TableName: CONNECTIONS_TABLE,
      Key: {
        email:        { S: email },
        connectionId: { S: connectionId }
      }
    }));
    await fetch(`${process.env.API_BASE_URL}/streams/unregister`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email })
    });
  }));

  return { statusCode: 200, body: "Disconnected and cleaned up" };
}
