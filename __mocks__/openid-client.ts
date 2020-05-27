import OpenIdClient, { TokenSet, Client } from 'openid-client';

class FakeClient {
  grant(): TokenSet {
    return new TokenSet({
      access_token: '123123123',
      token_type: 'Bearer',
      id_token: '1231231232',
      refresh_token: '123123123213',
      scope: 'a,b,c',
      expires_at: 123123123123,
      session_state: 'string',
    });
  }
}

// tslint:disable-next-line: max-classes-per-file
const FakeIssuer = new Issuer();

OpenIdClient.Issuer = FakeIssuer;

export default OpenIdClient;
