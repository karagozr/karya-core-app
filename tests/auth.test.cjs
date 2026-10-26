const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');

function storage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
  };
}

function load(relativePath, mocks = {}, globals = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(filename, 'utf8').replace('import.meta.env.VITE_API_URL', 'undefined');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, console, URL, URLSearchParams,
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
    ...globals,
  }, { filename });
  return module.exports;
}

const tokens = {
  access_token: 'opaque.encrypted.test.access.token',
  token_type: 'Bearer',
  expires_in: 60,
  scope: 'offline_access',
  refresh_token: 'opaque-refresh-test-token',
};
const user = { tenantId: 'tenant', username: 'tester', avatarUrl: '' };

const authDependencies = new WeakMap();

function setup(globals = { localStorage: storage(), sessionStorage: storage() }) {
  const dependencies = { axios: {}, notifications: [] };
  const session = load('src\\core\\services\\auth.ts', {
    axios: dependencies.axios,
    './api': { ApiRequest: {
      Post: (...args) => load('src\\core\\services\\api.ts', {
        axios: dependencies.axios,
        './auth': session,
        '../i18n': load('src\\core\\i18n.ts'),
        '../utils/message-box': { showMessage: message => dependencies.notifications.push(message) },
      }).ApiRequest.Post(...args),
      Get: (...args) => load('src\\core\\services\\api.ts', {
        axios: dependencies.axios,
        './auth': session,
        '../i18n': load('src\\core\\i18n.ts'),
        '../utils/message-box': { showMessage: message => dependencies.notifications.push(message) },
      }).ApiRequest.Get(...args),
    } },
    '../i18n': { coreI18n: { auth: {
      invalidTokenResponse: 'Invalid token response', authenticationFailed: 'Authentication failed',
      sessionExpired: 'Session expired', refreshFailed: 'Refresh failed',
    } } },
    '../utils/message-box': { showMessage: message => dependencies.notifications.push(message) },
  }, globals);
  authDependencies.set(session, dependencies);
  return { ...globals, session };
}

function loadAuth(session, axios, notifications = []) {
  const dependencies = authDependencies.get(session);
  Object.assign(dependencies.axios, axios);
  dependencies.notifications = notifications;
  return session;
}

test('token contract accepts opaque tokens and rejects malformed responses', () => {
  const { session } = setup();
  assert.equal(session.isTokenResponse(tokens), true);
  for (const invalid of [null, {}, { ...tokens, access_token: '' },
    { ...tokens, token_type: 'Basic' }, { ...tokens, expires_in: 0 },
    { ...tokens, expires_in: '3599' }, { ...tokens, expires_in: Infinity },
    { ...tokens, refresh_token: 123 }]) {
    assert.equal(session.isTokenResponse(invalid), false);
    assert.throws(() => session.saveAuthSession(invalid, user, false));
  }
});

test('resetPassword posts an encoded email query without creating a session', async () => {
  const { session } = setup();
  let request;
  loadAuth(session, {
    request: async config => { request = config; return { status: 200, data: null }; },
    isAxiosError: () => false,
  });
  const email = 'name+test@example.invalid';
  const result = await session.resetPassword(email);
  const url = new URL(request.url);
  assert.equal(url.pathname, '/api/auth/forgot-password');
  assert.equal(url.searchParams.get('email'), email);
  assert.equal(request.method, 'POST');
  assert.equal(request.data, null);
  assert.equal(result.success, true);
  assert.equal(session.readAuthSession(), null);
});

test('resetPassword propagates server failures and notifies the user', async () => {
  const context = refreshSetup(async () => {
    throw { isAxiosError: true, response: { status: 503 } };
  });
  const result = await context.session.resetPassword('test@example.invalid');
  assert.equal(result.success, false);
  assert.equal(result.status, 503);
  assert.equal(context.notifications.at(-1).type, 'error');
});

test('remember me selects storage; switching storage removes the previous session', () => {
  const { session, localStorage, sessionStorage } = setup();
  const before = Date.now();
  const saved = session.saveAuthSession(tokens, user, true);
  assert.ok(saved.expiresAt >= before + 60000);
  assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), tokens.access_token);
  assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), null);
  assert.equal(session.readAuthSession().refresh_token, tokens.refresh_token);
  session.saveAuthSession(tokens, user, false);
  assert.equal(localStorage.getItem('auth-token-session'), null);
  assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), null);
  assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), tokens.access_token);
  const reloaded = setup({ localStorage, sessionStorage }).session;
  assert.equal(reloaded.readAuthSession().user.username, user.username);
});

test('invalid users are rejected before replacing a valid stored session', () => {
  const { session } = setup();
  session.saveAuthSession(tokens, user, false);
  const version = session.authSessionRevision;
  for (const invalid of [null, {}, { ...user, username: 42 }, { ...user, avatarUrl: undefined }]) {
    assert.throws(() => session.saveAuthSession(tokens, invalid, true), /Invalid authentication user/);
    assert.equal(session.authSessionRevision, version);
    assert.equal(session.readAuthSession().user.username, user.username);
  }
});

test('expired, corrupt and signed-out sessions cannot supply an access token', () => {
  const { session, localStorage } = setup();
  session.saveAuthSession(tokens, user, true);
  localStorage.setItem(session.authStorageKeys.expiresAt, String(Date.now() - 1));
  assert.equal(session.getSessionAccessToken(), '');
  assert.equal(session.readAuthSession().refresh_token, tokens.refresh_token);
  localStorage.setItem(session.authStorageKeys.expiresAt, 'invalid-number');
  assert.equal(session.readAuthSession(), null);
  session.saveAuthSession(tokens, user, true);
  session.clearAuthSession();
  assert.equal(session.readAuthSession(), null);
  assert.equal(session.getSessionAccessToken(), '');
});

test('API sends the opaque access token using the Bearer scheme', async () => {
  const { session } = setup();
  session.saveAuthSession(tokens, user, false);
  let request;
  const api = load('src\\core\\services\\api.ts', {
    axios: { request: async config => { request = config; return { status: 200, data: tokens }; } },
    './auth': session,
    '../utils/message-box': { showMessage() {} },
    '../i18n': { coreI18n: { api: { success: 'Success' } } },
  });
  const result = await api.ApiRequest.Post('https://example.invalid/login', {});
  assert.equal(result.success, true);
  assert.equal(request.headers.Authorization, `Bearer ${tokens.access_token}`);
  assert.equal(result.data.refresh_token, tokens.refresh_token);
});

test('sign-in sets the user, restores without profile requests and sign-out clears tokens', async () => {
  const { session, localStorage, sessionStorage } = setup();
  const state = [];
  const effects = [];
  const notifications = [];
  let cursor = 0;
  let requests = 0;
  let response = { success: true, data: tokens, status: 200, message: 'Success' };
  const service = loadAuth(session, {
    request: async config => {
      requests++;
      assert.equal(config.headers.grant_type, 'password');
      assert.equal(config.data.username, user.username);
      return response;
    },
    isAxiosError: () => false,
  }, notifications);
  const react = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], value => { state[index] = value; }];
    },
    useEffect: callback => effects.push(callback),
    useCallback: callback => callback,
  };
  const { useProvideAuthContext } = load('src\\core\\contexts\\auth-context.ts', {
    react,
    '../services': { ...service, ApiRequest: {
      Post: () => { throw new Error('Login must use connectToken'); },
      Get: () => { throw new Error('Profile endpoint must not be requested'); },
    } },
    '../services/auth': session,
    '../i18n': { coreI18n: { auth: {
      invalidTokenResponse: 'Invalid token response', authenticationFailed: 'Authentication failed',
    } } },
    '../utils/message-box': { showMessage: message => notifications.push(message) },
  }, {
    setTimeout(callback, delay) {
      assert.ok(delay >= 0 && delay <= 60000);
      return 1;
    },
    clearTimeout() {},
  });
  const auth = useProvideAuthContext();
  effects[0]();
  assert.equal(requests, 0);
  const result = await auth.signIn(user.tenantId, user.username, 'test-password', false);
  assert.equal(result.success, true);
  assert.equal(result.data.username, user.username);
  assert.equal(state[1].username, user.username);
  assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), tokens.access_token);
  assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), null);
  assert.equal(session.readAuthSession().refresh_token, tokens.refresh_token);
  state.length = 0;
  cursor = 0;
  const restored = useProvideAuthContext();
  effects.at(-2)();
  assert.equal(restored.user.username, user.username);
  assert.equal(requests, 1);
  auth.signOut();
  assert.equal(state[1], undefined);
  assert.equal(session.getSessionAccessToken(), '');
  response = { ...response, data: { access_token: 'missing-expiry' } };
  const invalid = await auth.signIn(user.tenantId, user.username, 'test-password', false);
  assert.equal(invalid.success, false);
  assert.equal(session.readAuthSession(), null);
  assert.equal(notifications.at(-1).type, 'error');
  response = { ...response, data: { ...tokens, user: { ...user, avatarUrl: 'server-avatar' } } };
  const withProfile = await auth.signIn(user.tenantId, user.username, 'test-password', true);
  assert.equal(withProfile.success, true);
  assert.equal(withProfile.status, 200);
  assert.equal(withProfile.data.avatarUrl, 'server-avatar');
  assert.equal(session.readAuthSession().user.avatarUrl, 'server-avatar');
  assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), tokens.access_token);
  assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), null);
  cursor = 0;
  useProvideAuthContext();
  effects.at(-1)();
  auth.signOut();
  response = { ...response, data: tokens };
  const setItem = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('Storage unavailable'); };
  const failedSave = await auth.signIn(user.tenantId, user.username, 'test-password', true);
  localStorage.setItem = setItem;
  assert.equal(failedSave.success, false);
  assert.equal(session.readAuthSession(), null);
  assert.equal(state[1], undefined);
});

test('connectToken normalizes expiry and returns numeric HTTP errors without persisting', async () => {
  const { session, sessionStorage } = setup();
  const notifications = [];
  let request;
  let response = { status: 200, data: tokens };
  let failure;
  const service = loadAuth(session, {
    request: async config => {
      request = config;
      if (failure) throw failure;
      return response;
    },
    isAxiosError: error => error?.isAxiosError === true,
  }, notifications);
  const before = Date.now();
  const result = await service.connectToken({ grantType: 'password', ...user, password: 'test' });
  assert.equal(result.success, true);
  assert.equal(result.status, 200);
  assert.equal(result.data.accessToken, tokens.access_token);
  assert.ok(result.data.expiresAt >= before + tokens.expires_in * 1000);
  assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), null);
  assert.equal(session.readAuthSession(), null);
  await service.connectToken({ grantType: 'refresh_token', refreshToken: 'a+b&c' });
  assert.equal(request.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(request.data, 'grant_type=refresh_token&refresh_token=a%2Bb%26c');
  failure = { isAxiosError: true, response: {
    status: 400, data: { error: 'invalid_grant', error_description: 'Invalid credentials' },
  } };
  const denied = await service.connectToken({ grantType: 'password', ...user, password: 'wrong' });
  assert.equal(denied.success, false);
  assert.equal(denied.status, 400);
  assert.equal(denied.message, 'Invalid credentials');
  assert.equal(notifications.at(-1).message, 'Invalid credentials');
  failure = undefined;
  response = { status: 200, data: { ...tokens, user: { username: 42 } } };
  assert.equal((await service.connectToken({ grantType: 'password', ...user, password: 'test' })).success, false);
});

test('unavailable login service returns an explicit failure and creates no session', async () => {
  for (const failure of [
    { isAxiosError: true, code: 'ECONNREFUSED' },
    { isAxiosError: true, code: 'ECONNABORTED' },
    { isAxiosError: true, response: { status: 503 } },
  ]) {
    const { session, localStorage, sessionStorage } = setup();
    const notifications = [];
    const service = loadAuth(session, {
      request: async () => { throw failure; },
      isAxiosError: error => error?.isAxiosError === true,
    }, notifications);
    const result = await service.connectToken({ grantType: 'password', ...user, password: 'synthetic-test' });
    assert.equal(result.success, false);
    assert.equal(result.data, null);
    assert.equal(result.status, failure.response?.status ?? 0);
    assert.ok(result.message);
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].type, 'error');
    assert.equal(session.readAuthSession(), null);
    assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), null);
    assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), null);
  }
});

test('one-minute expiry refreshes at the boundary and signs out on an outage', async () => {
  let now = Date.now();
  let calls = 0;
  const context = setup({
    localStorage: storage(), sessionStorage: storage(),
    Date: class extends Date { static now() { return now; } },
  });
  loadAuth(context.session, {
    request: async () => {
      calls++;
      throw { isAxiosError: true, code: 'ECONNREFUSED' };
    },
    isAxiosError: error => error?.isAxiosError === true,
  });
  const initial = context.session.saveAuthSession(tokens, user, false);
  assert.equal(initial.expiresAt, now + 60000);
  now = initial.expiresAt - 1;
  assert.equal(await context.session.ensureAccessToken(), tokens.access_token);
  assert.equal(calls, 0);
  now++;
  assert.equal(context.session.getSessionAccessToken(), '');
  await assert.rejects(context.session.ensureAccessToken());
  assert.equal(calls, 1);
  assert.equal(context.session.readAuthSession(), null);
  assert.equal(await context.session.ensureAccessToken(), '');
  assert.equal(calls, 1);
});

test('getProfile uses ApiRequest GET with the current token and leaves session state unchanged', async () => {
  const context = setup();
  const profile = { tenantId: user.tenantId, username: user.username, email: 'test@example.invalid' };
  let request;
  loadAuth(context.session, {
    request: async config => {
      request = config;
      return { status: 200, data: profile };
    },
    isAxiosError: () => false,
  });
  context.session.saveAuthSession(tokens, user, false);
  const version = context.session.authSessionRevision;
  const result = await context.session.getProfile();
  assert.equal(request.url, 'https://localhost:7131/api/auth/profile');
  assert.equal(request.method, 'GET');
  assert.equal(request.headers.Authorization, `Bearer ${tokens.access_token}`);
  assert.equal(request.data, undefined);
  assert.equal(result.status, 200);
  assert.equal(result.success, true);
  assert.deepEqual(result.data, profile);
  assert.equal(context.session.authSessionRevision, version);
});

test('getProfile refreshes an expired token before sending the GET request', async () => {
  const order = [];
  const context = refreshSetup(async config => {
    if (config.url === context.session.authTokenEndpoint) {
      order.push('refresh');
      return { status: 200, data: { ...tokens, access_token: 'profile-access' } };
    }
    order.push('profile');
    assert.equal(config.method, 'GET');
    assert.equal(config.headers.Authorization, 'Bearer profile-access');
    return { status: 200, data: { username: user.username } };
  });
  context.session.saveAuthSession(tokens, user, false);
  expire(context);
  const result = await context.session.getProfile();
  assert.equal(result.success, true);
  assert.deepEqual(order, ['refresh', 'profile']);
});

test('getProfile propagates service failures through ApiRequest without a fake profile', async () => {
  for (const status of [0, 403, 404, 503]) {
    const context = refreshSetup(async () => {
      throw { isAxiosError: true, response: status ? { status } : undefined };
    });
    context.session.saveAuthSession(tokens, user, false);
    const result = await context.session.getProfile();
    assert.equal(result.success, false);
    assert.equal(result.status, status);
    assert.equal(result.data, null);
    assert.equal(context.notifications.at(-1).type, 'error');
  }
});
function refreshSetup(request) {
  const context = setup();
  const notifications = [];
  const axios = { request, isAxiosError: error => error?.isAxiosError === true };
  const refresh = loadAuth(context.session, axios, notifications);
  return { ...context, refresh, notifications, axios: authDependencies.get(refresh).axios };
}

function expire(context) {
  const storage = context.session.readAuthSession().rememberMe ? context.localStorage : context.sessionStorage;
  storage.setItem(context.session.authStorageKeys.expiresAt, String(Date.now() - 1));
}

test('tokens are stored separately and user fields share one JSON value', () => {
  for (const persistent of [true, false]) {
    const { session, localStorage, sessionStorage } = setup();
    const saved = session.saveAuthSession(tokens, user, persistent);
    const selected = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    const expected = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type,
      expiresIn: String(tokens.expires_in),
      expiresAt: String(saved.expiresAt),
      scope: tokens.scope,
      user: JSON.stringify(user),
    };
    for (const [field, key] of Object.entries(session.authStorageKeys)) {
      assert.equal(selected.getItem(key), expected[field]);
      assert.equal(other.getItem(key), null);
    }
    assert.equal(selected.getItem('auth-token-session'), null);
    assert.equal(selected.getItem('auth-session'), null);
    assert.equal(session.readAuthSession().user.username, user.username);
    for (const key of ['auth-tenant-id', 'auth-username', 'auth-avatar-url']) {
      assert.equal(selected.getItem(key), null);
    }
    session.clearAuthSession();
    for (const key of Object.values(session.authStorageKeys)) {
      assert.equal(selected.getItem(key), null);
    }
  }
});

test('invalid or missing user JSON is rejected and clears the session', () => {
  for (const value of [null, '{broken', 'null', '[]', '{"username":"tester"}']) {
    const { session, localStorage } = setup();
    session.saveAuthSession(tokens, user, true);
    if (value === null) localStorage.removeItem(session.authStorageKeys.user);
    else localStorage.setItem(session.authStorageKeys.user, value);
    assert.equal(session.readAuthSession(), null);
    assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), null);
  }
});

test('saving and clearing remove legacy user fields from both storages', () => {
  const { session, localStorage, sessionStorage } = setup();
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ['auth-tenant-id', 'auth-username', 'auth-avatar-url']) storage.setItem(key, 'legacy');
  }
  session.saveAuthSession(tokens, user, false);
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ['auth-tenant-id', 'auth-username', 'auth-avatar-url']) assert.equal(storage.getItem(key), null);
  }
  assert.deepEqual(JSON.parse(sessionStorage.getItem(session.authStorageKeys.user)), user);
  session.clearAuthSession();
  assert.equal(sessionStorage.getItem(session.authStorageKeys.user), null);
});

test('saving a new session removes optional values from the previous session', () => {
  const { session, localStorage } = setup();
  session.saveAuthSession(tokens, user, true);
  session.saveAuthSession({ access_token: 'new', token_type: 'Bearer', expires_in: 3600 }, user, true);
  assert.equal(localStorage.getItem(session.authStorageKeys.refreshToken), null);
  assert.equal(localStorage.getItem(session.authStorageKeys.scope), null);
  assert.equal(session.readAuthSession().refresh_token, undefined);
});

test('partial session fields are rejected and cannot be mixed across storages', () => {
  const { session, localStorage, sessionStorage } = setup();
  session.saveAuthSession(tokens, user, true);
  sessionStorage.setItem(session.authStorageKeys.accessToken, 'partial-session');
  assert.equal(session.readAuthSession(), null);
  assert.equal(localStorage.getItem(session.authStorageKeys.accessToken), null);
  assert.equal(sessionStorage.getItem(session.authStorageKeys.accessToken), null);
});

test('a failed storage write clears partial token and user fields', () => {
  const { session, localStorage } = setup();
  const setItem = localStorage.setItem;
  localStorage.setItem = (key, value) => {
    if (key === session.authStorageKeys.expiresAt) throw new Error('Storage quota exceeded');
    setItem(key, value);
  };
  assert.throws(() => session.saveAuthSession(tokens, user, true), /Storage quota/);
  for (const key of Object.values(session.authStorageKeys)) {
    assert.equal(localStorage.getItem(key), null);
  }
  assert.equal(session.readAuthSession(), null);
});

test('refresh uses only form-encoded grant and token, rotates tokens and preserves persistence', async () => {
  for (const persistent of [true, false]) {
    let request;
    const context = refreshSetup(async config => {
      request = config;
      return { data: { ...tokens, access_token: 'new-access', refresh_token: 'new-refresh' } };
    });
    context.session.saveAuthSession({ ...tokens, refresh_token: 'token+with/special=& chars' }, user, persistent);
    expire(context);
    const access = await context.refresh.ensureAccessToken();
    assert.equal(access, 'new-access');
    assert.equal(request.url, context.session.authTokenEndpoint);
    assert.equal(request.method, 'POST');
    assert.equal(request.headers['Content-Type'], 'application/x-www-form-urlencoded');
    assert.equal(request.headers.Authorization, undefined);
    assert.equal(request.data, 'grant_type=refresh_token&refresh_token=token%2Bwith%2Fspecial%3D%26+chars');
    assert.equal(context.session.readAuthSession().refresh_token, 'new-refresh');
    assert.equal(context.session.readAuthSession().user.username, user.username);
    assert.equal(context.session.readAuthSession().rememberMe, persistent);
  }
});

test('parallel refresh requests share one flight and retain refresh token when omitted', async () => {
  let calls = 0;
  let resolve;
  const context = refreshSetup(() => {
    calls++;
    return new Promise(done => { resolve = done; });
  });
  context.session.saveAuthSession(tokens, user, false);
  const first = context.refresh.refreshAccessToken();
  const second = context.refresh.refreshAccessToken();
  assert.equal(first, second);
  assert.equal(calls, 1);
  resolve({ data: { access_token: 'renewed', expires_in: 3600, token_type: 'Bearer' } });
  await Promise.all([first, second]);
  assert.equal(context.session.readAuthSession().refresh_token, tokens.refresh_token);
});

test('scope is optional in both the original grant and the refresh response', async () => {
  const context = refreshSetup(async () => ({
    data: { access_token: 'renewed-without-scope', token_type: 'Bearer', expires_in: 3600, refresh_token: 'rotated' },
  }));
  context.session.saveAuthSession({
    access_token: 'original', token_type: 'Bearer', expires_in: 1, refresh_token: 'original-refresh',
  }, user, false);
  assert.equal(await context.refresh.refreshAccessToken(), 'renewed-without-scope');
  assert.equal(context.session.readAuthSession().scope, undefined);
});

test('all refresh failures clear the session and notify, including server and network errors', async () => {
  for (const status of [400, 401, 503, 0]) {
    const context = refreshSetup(async () => {
      throw { isAxiosError: true, response: { status, data: { error: 'invalid_grant' } } };
    });
    context.session.saveAuthSession(tokens, user, true);
    await assert.rejects(context.refresh.refreshAccessToken());
    assert.equal(context.session.readAuthSession(), null);
    assert.equal(context.notifications.length, 1);
    await assert.rejects(context.refresh.refreshAccessToken());
  }
});

test('unresponsive refresh times out in three seconds and clears the session without retrying', async () => {
  const http = require('node:http');
  const axios = require('axios');
  const server = http.createServer(() => {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const context = refreshSetup(config => {
      assert.equal(config.timeout, 3000);
      return axios.request({
        ...config,
        url: `http://127.0.0.1:${server.address().port}`,
        proxy: false,
      });
    });
    context.session.saveAuthSession(tokens, user, false);
    const started = performance.now();
    await assert.rejects(context.refresh.refreshAccessToken());
    const duration = performance.now() - started;
    assert.ok(duration >= 2800 && duration < 4000, `Refresh took ${duration}ms`);
    assert.equal(context.session.readAuthSession(), null);
    assert.equal(context.notifications.at(-1).type, 'warning');
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('late refresh cannot resurrect sign-out or overwrite a newer login', async () => {
  for (const newLogin of [false, true]) {
    let resolve;
    const context = refreshSetup(() => new Promise(done => { resolve = done; }));
    context.session.saveAuthSession(tokens, user, true);
    const pending = context.refresh.refreshAccessToken();
    context.session.clearAuthSession();
    if (newLogin) context.session.saveAuthSession({ ...tokens, access_token: 'other-login' }, user, false);
    resolve({ data: { ...tokens, access_token: 'stale-refresh' } });
    await assert.rejects(pending);
    assert.equal(context.session.getSessionAccessToken(), newLogin ? 'other-login' : '');
  }
});

test('API refreshes on 401 and retries only once; login does not send bearer or refresh', async () => {
  let calls = 0;
  let refreshCalls = 0;
  const context = refreshSetup(async config => {
    if (config.url === context.session.authTokenEndpoint) {
      refreshCalls++;
      return { data: { ...tokens, access_token: 'renewed' } };
    }
    calls++;
    if (calls === 1) throw { isAxiosError: true, response: { status: 401 } };
    assert.equal(config.headers.Authorization, 'Bearer renewed');
    return { status: 200, data: { ok: true } };
  });
  context.session.saveAuthSession(tokens, user, false);
  const api = load('src\\core\\services\\api.ts', {
    axios: context.axios, './auth': context.session,
    '../utils/message-box': { showMessage() {} },
    '../i18n': { coreI18n: { api: { success: 'Success' } } },
  });
  assert.equal((await api.ApiRequest.Get('https://example.invalid/items', null)).success, true);
  assert.equal(calls, 2);
  assert.equal(refreshCalls, 1);
  context.axios.request = async config => {
    assert.equal(config.headers.Authorization, undefined);
    return { status: 200, data: tokens };
  };
  await api.ApiRequest.Post(context.session.authTokenEndpoint, {});
  assert.equal(refreshCalls, 1);
});

test('expired access token is refreshed before the protected request is sent', async () => {
  const order = [];
  const context = refreshSetup(async config => {
    if (config.url === context.session.authTokenEndpoint) {
      order.push('refresh');
      return { data: { ...tokens, access_token: 'fresh-access' } };
    }
    order.push('protected');
    assert.equal(config.headers.Authorization, 'Bearer fresh-access');
    return { status: 200, data: {} };
  });
  context.session.saveAuthSession(tokens, user, false);
  expire(context);
  const api = load('src\\core\\services\\api.ts', {
    axios: context.axios, './auth': context.session,
    '../utils/message-box': { showMessage() {} },
    '../i18n': { coreI18n: { api: { success: 'Success' } } },
  });
  assert.equal((await api.ApiRequest.Get('/protected', null)).success, true);
  assert.deepEqual(order, ['refresh', 'protected']);
});

test('a second 401 ends the session without another retry', async () => {
  let protectedCalls = 0;
  let refreshCalls = 0;
  const context = refreshSetup(async config => {
    if (config.url === context.session.authTokenEndpoint) {
      refreshCalls++;
      return { data: { ...tokens, access_token: 'fresh-access' } };
    }
    protectedCalls++;
    throw { isAxiosError: true, response: { status: 401 } };
  });
  context.session.saveAuthSession(tokens, user, false);
  const api = load('src\\core\\services\\api.ts', {
    axios: context.axios, './auth': context.session,
    '../utils/message-box': { showMessage() {} },
    '../i18n': { coreI18n: { api: { unauthorized: 'Unauthorized', withStatus: () => 'Unauthorized' } } },
  });
  const result = await api.ApiRequest.Get('/protected', null);
  assert.equal(result.success, false);
  assert.equal(result.status, 401);
  assert.equal(protectedCalls, 2);
  assert.equal(refreshCalls, 1);
  assert.equal(context.session.readAuthSession(), null);
});

test('malformed refresh response or missing refresh token cannot create a successful session', async () => {
  const context = refreshSetup(async () => ({ data: { access_token: 'incomplete' } }));
  context.session.saveAuthSession(tokens, user, true);
  await assert.rejects(context.refresh.refreshAccessToken());
  assert.equal(context.session.readAuthSession(), null);
  assert.equal(context.notifications[0].type, 'error');
  context.session.saveAuthSession({ access_token: 'access-only', token_type: 'Bearer', expires_in: 1 }, user, false);
  await assert.rejects(context.refresh.refreshAccessToken());
  assert.equal(context.session.readAuthSession(), null);
});

test('context does not auto-refresh expired sessions', async () => {
  let refreshCalls = 0;
  const context = refreshSetup(async () => {
    refreshCalls++;
    return { data: { ...tokens, access_token: 'timer-refreshed' } };
  });
  const initial = context.session.saveAuthSession(tokens, user, true);
  const state = [];
  const effects = [];
  const timers = [];
  let cursor = 0;
  let now = Date.now();
  const react = {
    ...React,
    useState(initialValue) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initialValue === 'function' ? initialValue() : initialValue;
      return [state[index], value => { state[index] = value; }];
    },
    useEffect: callback => effects.push(callback),
    useCallback: callback => callback,
  };
  const { useProvideAuthContext } = load('src\\core\\contexts\\auth-context.ts', {
    react, '../services': { ApiRequest: {} },
    '../services/auth': context.session,
    '../i18n': { coreI18n: { auth: {} } },
    '../utils/message-box': { showMessage() {} },
  }, {
    Date: class extends Date { static now() { return now; } },
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; },
    clearTimeout() {},
  });
  useProvideAuthContext();
  const unsubscribe = effects[0]();
  assert.equal(effects.length, 1);
  assert.equal(timers.length, 0);
  now = initial.expiresAt;
  assert.equal(refreshCalls, 0);
  assert.equal(state[0].access_token, initial.access_token);
  assert.equal(state[1].username, user.username);
  assert.equal(state[2], false);
  unsubscribe();
});
