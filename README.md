# React + TypeScript + Vite

## Dashboard appearance

### Backend authentication

Set `VITE_DASHBOARD_API_URL` in `.env.local` to your own Dashboard backend
endpoint and restart Vite. Leave it empty to use the public demo without
application credentials. Never configure a third-party endpoint for authenticated
Dashboard requests. Vite environment values are public configuration, not secrets.

With a backend configured, `fetchRemoteService.beforeSend` reads the current
unexpired session token for each request and adds `Authorization: Bearer ...`.
This also applies to the Fetch transport's export downloads. Tokens are not
stored in component props or captured once at mount. Missing/expired sessions
show a warning and block the request. This synchronous hook does not wait for
refresh or retry a 401; session renewal remains the responsibility of the auth
context. Cross-origin backends must allow the application origin and the
`Authorization` header in CORS, validate the token, and enforce authorization.
No authenticated backend integration has been verified yet.

The application, navigation and dashboard use Material Blue Compact in both
light and dark modes. ThemeBuilder metadata under `src/themes` defines the
application themes; run `npm run build-themes` after changing that metadata.
The dashboard loads Analytics common/query-builder styles and matching Material
Blue Compact light/dark Analytics, Dashboard and DevExtreme styles in
`src/core/pages/dash-page.scss`. Dashboard widget styles are scoped to its area.
Dashboard and Analytics theme styles follow the existing root theme swatch.
Keep these packages on matching versions when upgrading.
DevExtreme, Dashboard, Analytics and ThemeBuilder are pinned to 26.1.6.
The public demo service returns color-style objects; the older 25.2.7 client
expects numeric ARGB colors and renders those objects as transparent series.
Use a backend compatible with the pinned client version. Do not normalize
server responses or override chart colors to conceal a version mismatch.

The dashboard follows `ThemeContext` without recreating the control. A memoized
dashboard view keeps its instance and data while CSS follows the root swatch.
On theme changes, `currentTheme` and `refreshTheme` update existing DevExtreme
visualizations locally without reloading dashboard data. These public APIs also
update other DevExtreme charts on the page. Filters, selections and the
full-height layout are retained without serializing dashboard state.
The dashboard page wraps `BaseMainPage` in a flex column. Its content block and
dashboard host share the remaining height below the page heading; the control
fills the host without relying on percentage heights through auto-sized parents.

The dashboard's outer layout padding is disabled using `DockingLayoutSettings`
so its own sizing calculations also account for the removed space. This is an
internal, application-wide Dashboard setting in the pinned package version;
verify this integration when upgrading DevExpress. CSS-only padding overrides
leave unused space because Dashboard subtracts the padding from item sizes.
While a Dashboard fullscreen overlay is open, its scoped CSS lowers the
application header below the overlay so the mobile Back toolbar remains
visible and interactive. Closing fullscreen restores the normal header layer.

Run `node --test tests/dashboard.test.cjs` to check version alignment and compile
both scoped dashboard themes. After upgrading, also verify actual chart series
and theme switching against the configured dashboard backend in the browser.

## Authentication

Login accepts an OAuth-style response containing `access_token`, `token_type`
(`Bearer`), `expires_in` (seconds), and optional `scope` / `refresh_token`.
Tokens are treated as opaque values, including encrypted JWE tokens.

`connectToken` validates and normalizes the token response to `IAuthData` without
writing storage. The auth context calls `saveToken` after successful login.
Expiry is calculated from `expires_in` in seconds; `expires_at` is not required.
Login uses the existing JSON request with the `grant_type: password` header.
If the response includes a user, it must contain string `tenantId`, `username`,
and `avatarUrl` fields. Otherwise the login form's tenant ID and username
identify the user. Login and startup do not request a profile endpoint.
Selecting "Remember me" stores the
session in local storage; otherwise session storage is used. Reloading restores
an unexpired session. API requests use the access token in the Bearer header.
Token values are stored individually as plain strings; user fields share one JSON object:

| Storage key | Value |
| --- | --- |
| `access-token` | `access_token` |
| `refresh-token` | `refresh_token` (when supplied) |
| `token-type` | `token_type` |
| `expires-in` | `expires_in`, in seconds |
| `expires-at` | Absolute expiry, in milliseconds since Unix epoch |
| `auth-scope` | `scope` (when supplied) |
| `auth-user` | JSON containing `tenantId`, `username`, and `avatarUrl` |

All fields use the same storage selected by "Remember me". Missing optional
fields are removed, not saved as `"undefined"`. Login, logout, and storage-write
failures clear session fields from both storages. The old JSON session format
is not restored; users with an old-format session need to sign in again.
Legacy separate user keys are removed when saving or clearing a session.

Signing out clears the stored session. Expired access tokens are renewed using
`POST https://localhost:7131/api/auth/login`, the same endpoint as login:

```text
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=<URL-encoded refresh token>
```

Refresh requests send neither credentials nor an Authorization header. Returned
refresh tokens replace the previous token; if omitted, the existing refresh
token is retained. The storage choice and user identity remain unchanged.
Renewal runs at expiry (including after reload) and before API calls using an
expired token. A 401 response triggers renewal and one retry only. Concurrent
renewals share one request. Any refresh failure clears the session and returns
the user to login, including network/server errors. Refresh requests time out
after 3 seconds and are not retried automatically; password login retains its
15-second timeout. Without a refresh token, expiry requires signing in again.

`getProfile()` retrieves `GET /api/auth/profile` through `ApiRequest.Get`.
`resetPassword(email)` requests a reset link through `ApiRequest.Post` at
`POST /api/auth/forgot-password?email=...`, matching the backend OpenAPI contract.
Both reset-password forms use this method and check `result.success`.
It uses the same authentication, token renewal, and error handling as other API
calls, and returns the API response without changing the stored user. It is an
explicit call, not an automatic login/startup request.

The regression suite uses a 60-second token lifetime and covers invalid
credentials, connection refusal, a real 3-second refresh timeout, 503 responses, and
profile requests. It does not require a running backend or real credentials.
Local integration checks also verified successful/failed login and refresh
after actual expiry; a one-minute lifetime may be reported as 59 remaining seconds.
The checked local server returned 404 for both `/api/auth/profile` and
`/auth/profile`, and its OpenAPI document did not expose a profile route.
The client method is tested, but a successful live profile response still
requires the backend to expose that endpoint.

All authentication logic lives in `src/core/services/auth.ts`; session and
refresh modules are no longer separate files. Login and refresh share one
token request implementation; stored and returned users share one validator.
Session storage is handled by
`readAuthSession`, `saveAuthSession`, and
`clearAuthSession`, with one shared storage writer. Refresh uses
`ensureAccessToken` for expiry checks and `refreshAccessToken` for shared
renewal requests. The session's `rememberMe` value reflects its storage
location; it is not an additional storage field.

Run authentication regression checks with `node --test tests/auth.test.cjs`.

## Form page modals

Render custom modals as children of `BaseFormPage`, not as siblings. The page
provides both `AppFormContext` and `AppModalContext` to its children, including
forms rendered inside modals:

```tsx
<BaseFormPage {...pageOptions}>
  <InventoryDetailModal id="inventory-detail" modalRef={modalRef} />
</BaseFormPage>
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
