// apps/api/src/websocket-handlers/disconnect/index.ts

import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayEventRequestContextV2
} from "aws-lambda";
import { ddb, apiGw, CONNECTIONS_TABLE } from "../common";
import {
  ScanCommand,
  DeleteItemCommand,
  ScanCommandOutput
} from "@aws-sdk/client-dynamodb";
import fetch from "node-fetch";

/**  
 * Extend the V2 context to include connectionId  
 */
interface WebSocketRequestContext extends APIGatewayEventRequestContextV2 {
  connectionId: string;
}

/**  
 * WebSocket event shape with our extended context  
 */
interface WebSocketEvent extends Omit<APIGatewayProxyEventV2, "requestContext"> {
  requestContext: WebSocketRequestContext;
}

/**
 * On WebSocket disconnect:
 * 1) Scan DynamoDB for all items with this connectionId
 * 2) Delete each mapping (email + connectionId)
 * 3) Notify the API to punch out that email
 */
export async function disconnectHandler(
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> {
  const connectionId = event.requestContext.connectionId;

  // 1) Scan for mappings by connectionId
  const scanRes: ScanCommandOutput = await ddb.send(
    new ScanCommand({
      TableName: CONNECTIONS_TABLE,
      FilterExpression: "connectionId = :cid",
      ExpressionAttributeValues: {
        ":cid": { S: connectionId }
      }
    })
  );

  const items = scanRes.Items ?? [];
  if (items.length === 0) {
    return { statusCode: 200, body: "No mapping found" };
  }

  // 2) For each mapping, delete it and notify the API
  await Promise.all(items.map(async (item) => {
    const email = item.email.S!;
    // Delete the mapping
    await ddb.send(
      new DeleteItemCommand({
        TableName: CONNECTIONS_TABLE,
        Key: {
          email: { S: email },
          connectionId: { S: connectionId }
        }
      })
    );
    // 3) Trigger the unregister endpoint
    await fetch(`${process.env.API_BASE_URL}/streams/unregister`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
  }));

  return { statusCode: 200, body: "Disconnected and cleaned up" };
}
