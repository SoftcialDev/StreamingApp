import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayEventRequestContextV2
} from "aws-lambda";
import { ddb, CONNECTIONS_TABLE } from "../common";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

/**
 * Extend the V2 context to include connectionId.
 */
interface WebSocketRequestContext extends APIGatewayEventRequestContextV2 {
  connectionId: string;
}

/**
 * WebSocket event shape with our extended context.
 */
interface WebSocketEvent extends Omit<APIGatewayProxyEventV2, "requestContext"> {
  requestContext: WebSocketRequestContext;
}

/**
 * On WebSocket $connect:
 * 1. Reads the connectionId from API Gateway
 * 2. Reads the `email` from the query string
 * 3. Persists { email, connectionId } into DynamoDB
 */
export async function connectHandler(
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> {
  const connectionId = event.requestContext.connectionId;
  const email = event.queryStringParameters?.email;
  if (!email) {
    return { statusCode: 400, body: "Missing email query parameter" };
  }

  await ddb.send(new PutItemCommand({
    TableName: CONNECTIONS_TABLE,
    Item: {
      email:        { S: email },
      connectionId: { S: connectionId }
    }
  }));

  return { statusCode: 200, body: "Connected" };
}
