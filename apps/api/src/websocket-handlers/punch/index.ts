import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs      = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.PUNCH_EVENTS_QUEUE_URL!;

/**
 * On WS “in” or “out” route (or a REST endpoint):
 * - Expects JSON body { email: string, action: "in"|"out" }
 * - Enqueues that payload to SQS for durable buffering
 */
export async function punchHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const { email, action } = JSON.parse(event.body || "{}");
  if (!email || (action !== "in" && action !== "out")) {
    return { statusCode: 400, body: "email and action=in|out required" };
  }

  await sqs.send(new SendMessageCommand({
    QueueUrl:    QUEUE_URL,
    MessageBody: JSON.stringify({ email, action, timestamp: Date.now() })
  }));

  return { statusCode: 200, body: "Enqueued" };
}
