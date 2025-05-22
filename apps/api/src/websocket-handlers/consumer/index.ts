import { SQSHandler, SQSRecord } from "aws-lambda";
import {
  ddb,
  CONNECTIONS_TABLE,
  sendToConnection
} from "../common";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.PUNCH_EVENTS_QUEUE_URL!;

/**
 * Automatically invoked by SQS event source mapping.
 * For each SQS record:
 * 1) Parses { email, action }
 * 2) Queries DynamoDB for that email’s connectionIds
 * 3) Uses API Gateway Management to push { action } to each
 * 4) Deletes the message from SQS on success
 */
export const handler: SQSHandler = async (event) => {
  await Promise.all(event.Records.map(async (record: SQSRecord) => {
    const { email, action } = JSON.parse(record.body);
    // 1) Lookup connections
    const q = await ddb.send(new QueryCommand({
      TableName:                 CONNECTIONS_TABLE,
      KeyConditionExpression:    "email = :e",
      ExpressionAttributeValues: { ":e": { S: email } }
    }));
    const items = q.Items ?? [];

    // 2) Push to each connection
    await Promise.all(items.map(item =>
      sendToConnection(item.connectionId.S!, { action })
    ));

    // 3) Remove message from queue
    await sqs.send(new DeleteMessageCommand({
      QueueUrl:      QUEUE_URL,
      ReceiptHandle: record.receiptHandle
    }));
  }));
};
