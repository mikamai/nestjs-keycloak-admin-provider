/* eslint-disable @typescript-eslint/camelcase */
import { Logger } from '@nestjs/common';
import KcAdminClient from 'keycloak-admin';
import { Issuer, TokenSet } from 'openid-client';

interface RealmConfig {
  baseUrl: string;
  realmName: string;
  clientId: string;
  clientSecret: string;
}

interface AuthConfig {
  jwtIssuer: string;
}

export class KeycloakProviderService {
  private client: KcAdminClient;
  private logger: Logger;
  private tokenSet: TokenSet;
  private issuerClient: any;
  private connectionConfig: any;

  constructor(private realmConfig: RealmConfig, private authConfig: AuthConfig, logLabel: string) {
    this.authConfig = authConfig;

    this.logger = new Logger(logLabel);

    this.client = new KcAdminClient({
      baseUrl: realmConfig.baseUrl,
      realmName: realmConfig.realmName,
    });

    this.connectionConfig = {
      clientId: this.realmConfig.clientId,
      clientSecret: this.realmConfig.clientSecret,
      grant_type: 'client_credentials',
      username: '',
      password: '',
    };
    this.initConnection();
  }

  async initConnection() {
    try {
      await this.client.auth({
        ...this.connectionConfig,
        grantType: this.connectionConfig.grant_type,
        grant_type: undefined,
      });
      const keycloakIssuer = await Issuer.discover(this.authConfig.jwtIssuer);
      this.issuerClient = new keycloakIssuer.Client({
        client_id: this.realmConfig.clientId,
        client_secret: this.realmConfig.clientSecret,
      });

      this.tokenSet = await this.issuerClient.grant(this.connectionConfig);

      this.initRefresh();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async initRefresh() {
    // Periodically using refresh_token grant flow to get new access token here
    // TODO: it will be better to check for token expiration instead of interval check
    setInterval(async () => {
      const refreshToken = this.tokenSet.refresh_token;
      try {
        this.tokenSet = await this.issuerClient.refresh(refreshToken);
      } catch (e) {
        if (e.name === 'TimeoutError' || e?.error === 'invalid_grant') {
          this.tokenSet = await this.issuerClient.grant(this.connectionConfig);
        } else {
          this.logger.error(e);
          throw e;
        }
      }
      this.client.setAccessToken(this.tokenSet.access_token);
    }, 58 * 1000); // 58 seconds
  }

  getClient() {
    return this.client;
  }
}
