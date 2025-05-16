/**
 * server.ts
 * Starts the Express app on the configured port.
 */

import app from "./app";
import config from "./config";

const port = config.port;

app.listen(port, () => {
  console.log(`🚀 API server listening on port ${port}`);
});
