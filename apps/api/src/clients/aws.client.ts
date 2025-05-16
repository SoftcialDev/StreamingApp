/**
 * clients/aws.client.ts
 * Adapt the new `videoService` singleton into standalone functions,
 * plus re-export the HLS helper from common.
 */

import { videoService } from "@streaming-app/common/src/aws/videoService";
import { getHlsUrl as commonGetHlsUrl } from "@streaming-app/common/src/aws/hls";

// Bind to preserve `this` when calling
export const ensureStream = videoService.ensureStream.bind(videoService);
export const deleteStream = videoService.deleteStream.bind(videoService);

// Re-export the HLS URL helper from common
export const getHlsUrl = commonGetHlsUrl;
