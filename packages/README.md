# @streaming-app/common

Shared utilities and configuration for the Streaming App monorepo.

## Overview
This package centralizes:
- Cognito authentication (username/password + MS365 federation)
- JWT verification middleware for Express
- Redis client with helper methods for stream mapping and session management
- AWS Kinesis Video Streams utilities (create/delete streams)
- HLS URL generation

## Installation

```bash
cd packages/common
npm install
