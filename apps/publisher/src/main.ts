// main.ts
/**
 * ------------------------------------------------------------
 * ELECTRON + EXPRESS SINGLE ENTRYPOINT
 * ------------------------------------------------------------
 * - Loads & validates environment variables via dotenv
 * - Serves static files over Express
 * - Creates a single BrowserWindow for login & callback flow
 * - Intercepts OAuth redirect to exchange code for tokens
 * - Persists tokens & user email, initializes AWS workflows
 */

import 'dotenv/config';
import path from 'path';
import express from 'express';
import { app, BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand
} from '@aws-sdk/client-sqs';
import { exchangeAuthCodeForTokens } from './auth/oauth';
import { fetchAwsCredentials } from './auth/identity';
import { connectWS } from './ws/client';
import { startPipeline, stopPipeline } from './gst/pipeline';
import { log, error } from './util/logger';

// Validate required env vars
const {
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
  COGNITO_IDENTITY_POOL_ID,
  AWS_REGION,
  API_WS_URL,
  PUNCH_API_URL,
  PUNCH_QUEUE_URL,
  REDIRECT_URI = 'http://localhost:5000/callback',
  PUBLISHER_PORT = '5000'
} = process.env;

if (
  !COGNITO_DOMAIN ||
  !COGNITO_CLIENT_ID ||
  !COGNITO_IDENTITY_POOL_ID ||
  !AWS_REGION ||
  !API_WS_URL ||
  !PUNCH_API_URL ||
  !PUNCH_QUEUE_URL
) {
  throw new Error('Missing required environment variables');
}

// ——— Express static server ———
const staticServer = express();
const publicDir = path.resolve(__dirname, '../public');

// Sirve el login
staticServer.get(['/', '/index.html'], (_req, res) =>
  res.sendFile(path.join(publicDir, 'index.html'))
);

// Añade esta ruta para /callback
staticServer.get('/callback', (_req, res) =>
  res.sendFile(path.join(publicDir, 'callback.html'))
);

// Luego sirven el resto de estáticos
staticServer.use(express.static(publicDir));

// 404 para todo lo demás
staticServer.use((_req, res) => res.status(404).send('Not found'));

staticServer.listen(Number(PUBLISHER_PORT), () => {
  console.log(`Static server listening on http://localhost:${PUBLISHER_PORT}`);
});

// ——— Persistent store & IPC ———
interface StoreSchema { token?: string; email?: string; pkce_verifier?: string }
const store = new Store<StoreSchema>();


ipcMain.handle('hasToken', () => Boolean(store.get('token')));
ipcMain.handle('saveCognitoToken', (_evt, token: string) => {
  store.set('token', token);
});
ipcMain.handle('exchangeAuthCode', async (_evt, code: string, verifier: string) => {
  store.set('pkce_verifier', verifier);
  console.log('Exchanging auth code:', { code, verifier });
  const tokens = await exchangeAuthCodeForTokens(code, verifier);
  store.set('token', tokens.id_token);
});
ipcMain.handle('saveVerifier', (_evt, verifier: string) => {
  store.set('pkce_verifier', verifier);
});

// ——— Main window & OAuth flow ———
let mainWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [
        `--cognitoDomain=${COGNITO_DOMAIN}`,
        `--cognitoClientId=${COGNITO_CLIENT_ID}`,
        `--redirectUri=${REDIRECT_URI}`,
        `--identityPoolId=${COGNITO_IDENTITY_POOL_ID}`
      ]
    }
  });

  mainWindow.loadURL(`http://localhost:${PUBLISHER_PORT}/index.html`);

  // Intercept the callback redirect only to exchange the code
  mainWindow.webContents.on('will-redirect', async (event, url) => {
    if (!url.startsWith(REDIRECT_URI)) return;
    event.preventDefault();

    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    const errorParam = parsed.searchParams.get('error');
    const verifier = store.get('pkce_verifier');
   console.log('OAuth redirect:', { code, errorParam, verifier, parsed });
    if (errorParam) {
      console.error('OAuth error:', errorParam);
      // Let the renderer show the error or retry button
      return;
    }
    if (!code || !verifier) {
      console.error('Missing code/verifier on redirect');
      return;
    }

    try {
      console.log('>> Calling token endpoint with code:', code, 'verifier:', verifier);
      const tokens = await exchangeAuthCodeForTokens(code, verifier);
      store.set('token', tokens.id_token);
      console.log('Tokens received:', tokens);

      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
      );
      const email = payload.email as string;
      store.set('email', email);

      const creds = await fetchAwsCredentials();
      connectWS(email, {
        onIn: () => startPipeline(email, creds),
        onOut: () => stopPipeline()
      });
      const response = await drainPendingPunches(email, creds);
      console.log('Drained pending punches:', response);
      //mainWindow?.close();
    } catch (e) {
      error('Auth exchange failed', e as Error);
      // Optionally notify renderer to show retry
    }
  });
}

// ——— Drain SQS ———
async function drainPendingPunches(
  email: string,
  creds: Awaited<ReturnType<typeof fetchAwsCredentials>>
) {
  const sqs = new SQSClient({ region: AWS_REGION });
  try {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: PUNCH_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 0
      })
    );
    for (const msg of res.Messages ?? []) {
      const body = JSON.parse(msg.Body!);
      if (body.email === email) {
        body.action === 'in' ? startPipeline(email, creds) : stopPipeline();
      }
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: PUNCH_QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle!
        })
      );
    }
  } catch (e) {
    error('Error draining SQS punches', e as Error);
  }
}

// ——— App lifecycle ———
app.whenReady().then(() => {
  const token = store.get('token');
  if (token) {
    fetchAwsCredentials()
      .then(creds => {
        const email = store.get('email')!;
        connectWS(email, {
          onIn: () => startPipeline(email, creds),
          onOut: () => stopPipeline()
        });
        return drainPendingPunches(email, creds);
      })
      .catch(() => createMainWindow());
  } else {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
