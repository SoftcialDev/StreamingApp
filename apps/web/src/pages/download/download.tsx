/**
 * src/pages/Download/Download.tsx
 *
 * Provides download links for the Electron Publisher installer.
 */

import Button from "@/components/ui/button";
import React from "react";


const Download: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-3xl font-bold mb-4">Download Publisher App</h1>
    <p className="mb-6">Choose your platform:</p>
    <div className="space-x-4">
      <Button
        as="a"
        href="https://your-installer-bucket.s3.amazonaws.com/streaming-publisher-setup.exe"
        download
      >
        Windows
      </Button>
      <Button
        as="a"
        href="https://your-installer-bucket.s3.amazonaws.com/streaming-publisher.AppImage"
        download
      >
        Linux
      </Button>
    </div>
  </div>
);

export default Download;
