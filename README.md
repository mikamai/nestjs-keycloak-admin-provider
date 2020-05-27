# NestJS Keycloak Admin Provider
That package will instance and mantain an admin client connection between the app and the Keycloak instance, 
the access token is refreshed every 58 seconds, and the grant is recreated when became invalid

## TODO
- Add a refresh_time parameter
- Allow a better parametrization
- More testing on token refresh
