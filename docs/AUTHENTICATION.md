# Authentication and credential handling

## Existing repository state

### companda-complex-onair

This repository is a static PWA. It has no user login, server session, access token, refresh token, password database, or backend authorization middleware. Browser storage is used only for non-secret UI state such as the last selected channel.

### companda-toto-ai reference implementation

The server reads `LIVE_PROVIDER_TOKEN` from the process environment and attaches it to outbound provider requests as `Authorization: Bearer <token>`. The token is therefore intended to remain server-side. `KAKAO_JS_KEY` is exposed through `/api/config`; because a JavaScript key is a public client identifier, its allowed domains must be restricted in the Kakao developer console. Sensitive REST keys/client secrets must not be exposed this way.

The current HTTP API routes (`/api/bootstrap`, `/api/refresh`, `/api/config`, `/api/games/*`, `/api/stream`) do not authenticate the browser user. Anyone who can reach the service can call those routes unless access is restricted elsewhere by the hosting platform or network.

## Recommended Companda Navigation authentication

Authentication is optional for basic navigation launching. A user account is needed only for synced favorites, recent destinations, device sync, or administrator functions.

Recommended flow:

1. Browser selects `카카오로 로그인`.
2. Server redirects to Kakao OAuth authorization endpoint with PKCE/state protection.
3. Kakao returns an authorization code to the registered callback URI.
4. Server exchanges the authorization code for provider tokens.
5. Provider access/refresh tokens are encrypted at rest on the server; they are never placed in localStorage/sessionStorage.
6. The browser receives only a short-lived application session cookie (`HttpOnly`, `Secure`, `SameSite=Lax` or stricter).
7. Every protected API route validates the server session and role before returning user data.
8. Logout revokes/clears the application session and, where required, disconnects the provider token.

## Third-party navigation accounts

Companda Navigation must not collect or reuse passwords for KakaoMap, NAVER Map, TMAP, iNavi, Google Maps, airline, ferry, or other third-party apps. Deep links hand off the destination to the official app; that app performs its own login and authorization.

## Secrets

Server-only environment variables should include, when enabled:

- `KAKAO_REST_API_KEY`
- `KAKAO_CLIENT_SECRET`
- `TMAP_APP_KEY`
- `PUBLIC_DATA_SERVICE_KEY`
- database encryption/session secrets

Never commit real values to Git. Keep only `.env.example` placeholders in the repository.
