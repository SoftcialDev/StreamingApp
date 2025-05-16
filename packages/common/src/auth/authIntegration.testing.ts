/*

import express, { RequestHandler } from 'express';
import request from 'supertest';
import { createJWKSMock } from 'mock-jwks';
import { setupServer } from 'msw/node';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { login } from './login';
import { verifyJwt } from './verifyJwt';
import { main as getTokenMain } from '../scripts/getToken';
import dotenv from 'dotenv';

dotenv.config();

describe('🔐 Full Auth Flow: login → getToken → verifyJwt', () => {
  const jwksUri = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/` +
                  `${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
  const jwksMock = createJWKSMock(jwksUri);
  const server = setupServer(jwksMock.mswHandler);  // Handler registered up front

  beforeAll(() => {
    jwksMock.start();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();  // Clear runtime handlers between tests :contentReference[oaicite:7]{index=7}
  });

  afterAll(() => {
    server.close();
    jwksMock.stop();
  });

  it('executes login → getToken → verifyJwt successfully', async () => {
    // A) login()
    const token = await login('dummy-username', 'dummy-password');
    expect(typeof token).toBe('string');

    // B) getToken script
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await expect(getTokenMain()).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalledWith('ACCESS_TOKEN=', token);
    logSpy.mockRestore();

    // C) verifyJwt middleware
    const app = express();
    const authMw = verifyJwt as unknown as RequestHandler;

    app.use('/protected', authMw, (req, res) => {
      res.json({ user: (req as any).user });  // Block arrow returns void
    });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.sub).toBe('test-user');
  });
});
*/