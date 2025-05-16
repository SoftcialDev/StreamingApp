import {
  DescribeStreamCommand,
  CreateStreamCommand,
  DeleteStreamCommand
} from "@aws-sdk/client-kinesis-video";
import { KinesisVideoService } from "./videoService";

describe("KinesisVideoService", () => {
  let mockSend: jest.Mock;
  let service: KinesisVideoService;

  beforeEach(() => {
    mockSend = jest.fn();
    // Inject a mock client with only the `send` method
    const mockClient = { send: mockSend } as any;
    service = new KinesisVideoService(mockClient);
  });

  describe("ensureStream", () => {
    it("returns existing ARN when stream exists", async () => {
      // Simulate DescribeStreamCommand success
      mockSend.mockResolvedValueOnce({ StreamInfo: { StreamARN: "arn:existing" } });

      const arn = await service.ensureStream("streamName");

      // First call should be DescribeStreamCommand
      expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeStreamCommand));
      expect(arn).toBe("arn:existing");
    });

    it("creates a new stream if not found", async () => {
      // Simulate DescribeStreamCommand throwing ResourceNotFoundException
      const err = new Error();
      (err as any).name = "ResourceNotFoundException";
      mockSend.mockRejectedValueOnce(err);
      // Simulate CreateStreamCommand success
      mockSend.mockResolvedValueOnce({ StreamARN: "arn:new" });

      const arn = await service.ensureStream("newStream");

      // Calls: first describe, then create
      expect(mockSend).toHaveBeenNthCalledWith(1, expect.any(DescribeStreamCommand));
      expect(mockSend).toHaveBeenNthCalledWith(2, expect.any(CreateStreamCommand));
      expect(arn).toBe("arn:new");
    });
  });

  describe("deleteStream", () => {
    it("uses provided version when deleting", async () => {
      await service.deleteStream("arn:toDelete", "v1");

      expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteStreamCommand));
      const cmd = mockSend.mock.calls[0][0] as DeleteStreamCommand;
      expect(cmd.input).toEqual({ StreamARN: "arn:toDelete", CurrentVersion: "v1" });
    });

    it("fetches current version if none provided", async () => {
      // Simulate DescribeStreamCommand returning version
      mockSend.mockResolvedValueOnce({ StreamInfo: { Version: "v2" } });

      await service.deleteStream("arn:toDelete");

      // Calls: first describe, then delete
      expect(mockSend).toHaveBeenNthCalledWith(1, expect.any(DescribeStreamCommand));
      expect(mockSend).toHaveBeenNthCalledWith(2, expect.any(DeleteStreamCommand));

      const cmd = mockSend.mock.calls[1][0] as DeleteStreamCommand;
      expect(cmd.input).toEqual({ StreamARN: "arn:toDelete", CurrentVersion: "v2" });
    });
  });
});
