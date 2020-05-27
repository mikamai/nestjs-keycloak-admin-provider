jest.mock('keycloak-admin');
jest.mock('openid-client');

import KcAdminClient from 'keycloak-admin';
import { KeycloakProviderService } from './keycloak-provider.service';
import KeycloakAdminClient from 'keycloak-admin';
import { Issuer } from 'openid-client';

describe('Keycloak provider', () => {
  let service: KeycloakProviderService;
  let client: KeycloakAdminClient;
  const realmConfig = {
    baseUrl: 'http://baseUrl',
    realmName: 'testRealm',
    clientId: 'testClient',
    clientSecret: 'secret',
  };

  const authConfig = {
    jwksUri: 'http://jwksUri',
    jwtAudience: 'testAudience',
    jwtIssuer: 'http://jwksIssuer',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    service = new KeycloakProviderService(realmConfig, authConfig, 'TESTLOG');
    client = service.getClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Basic flow', () => {
    it('should instance a new provider', () => {
      expect(service).toBeInstanceOf(KeycloakProviderService);
    });

    it('should instance a new Keycloak admin client', () => {
      expect(KcAdminClient).toHaveBeenCalledWith({
        baseUrl: realmConfig.baseUrl,
        realmName: realmConfig.realmName,
      });
    });

    it('should return the Keycloak admin client', () => {
      expect(client).toBeInstanceOf(KcAdminClient);
    });

    it('should have called the authentication method', () => {
      expect(Issuer.discover).toHaveBeenCalledTimes(1);
      expect(client.auth).toHaveBeenCalledTimes(1);
      expect(client.auth).toHaveBeenCalledWith({
        clientId: realmConfig.clientId,
        clientSecret: realmConfig.clientSecret,
        grantType: 'client_credentials',
        username: '',
        password: '',
      });
    });
  });
});
