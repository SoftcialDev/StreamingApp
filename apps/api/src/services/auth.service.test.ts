import dotenv from 'dotenv';
dotenv.config();

import { authenticateUser } from '../services/auth.service';

// Import exactly the same module specifiers your service uses:
import * as loginModule from '@streaming-app/common/src/auth/login';
import * as credsModule from '@streaming-app/common/src/auth/cognitoClient';

describe('authenticateUser()', () => {
  const REAL_USER = process.env.TEST_USERNAME!;
  const REAL_PASS = process.env.TEST_PASSWORD!;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('unit: throws when login() fails for a fake user', async () => {
    // Arrange: spy on login() to reject for a nonexistent user
    jest.spyOn(loginModule, 'login').mockRejectedValue(new Error('User does not exist'));

    // Act & Assert: authenticateUser should propagate the login error
    await expect(authenticateUser('no-such-user', 'bad-pass'))
      .rejects.toThrow('User does not exist');

    // Verify login() was called, and getAwsCredentials() was never invoked
    expect(loginModule.login).toHaveBeenCalledWith('no-such-user', 'bad-pass');
    expect(credsModule.getAwsCredentials).not.toHaveBeenCalled();
  });

  it('unit: throws when getAwsCredentials() fails after successful login', async () => {
    // Arrange: login() succeeds, but credential exchange fails
    const fakeToken = 'fake.jwt.token';
    jest.spyOn(loginModule, 'login').mockResolvedValue(fakeToken);
    jest.spyOn(credsModule, 'getAwsCredentials').mockRejectedValue(new Error('Identity pool error'));

    // Act & Assert: authenticateUser should propagate the credentials error
    await expect(authenticateUser('good-user', 'good-pass'))
      .rejects.toThrow('Identity pool error');

    // Verify both calls were made with correct arguments
    expect(loginModule.login).toHaveBeenCalledWith('good-user', 'good-pass');
    expect(credsModule.getAwsCredentials).toHaveBeenCalledWith(fakeToken);
  });

  it('unit: returns tokens when both login() and getAwsCredentials() succeed', async () => {
    // Arrange: both calls succeed
    const fakeToken = 'fake.jwt.token';
    const fakeCreds = {
      accessKeyId: 'AKIA...',
      secretAccessKey: 'SECRET',
      sessionToken: 'TOKEN',
      expiration: new Date(),
    };
    jest.spyOn(loginModule, 'login').mockResolvedValue(fakeToken);
    jest.spyOn(credsModule, 'getAwsCredentials').mockResolvedValue(fakeCreds);

    // Act
    const result = await authenticateUser('good-user', 'good-pass');

    // Assert
    expect(loginModule.login).toHaveBeenCalledWith('good-user', 'good-pass');
    expect(credsModule.getAwsCredentials).toHaveBeenCalledWith(fakeToken);
    expect(result).toEqual({
      accessToken: fakeToken,
      awsCreds: fakeCreds,
    });
  });
});
