import axios from 'axios';
import { coreI18n } from '../i18n';
import { showMessage } from '../utils/message-box';
import { ApiRequest, type IApiResponse } from './api';

export const authTokenEndpoint = 'https://localhost:7131/api/auth/login';
export const authStorageKeys = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'token-type',
  expiresIn: 'expires-in',
  expiresAt: 'expires-at',
  scope: 'auth-scope',
  user: 'auth-user',
};
const storageKeys = Object.values(authStorageKeys);
const listeners = new Set<() => void>();

export let authSessionVersion = 0;
export let authSessionGeneration = 0;
let pendingRefresh: { version: number; promise: Promise<string> } | undefined;

export interface AuthUser {
  tenantId: string;
  username: string;
  avatarUrl: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
}

export interface AuthSession extends TokenResponse {
  expiresAt: number;
  user: AuthUser;
  rememberMe: boolean;
}

export const subscribeAuthSession = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const isTokenResponse = (value: unknown): value is TokenResponse => {
  if (typeof value !== 'object' || value === null) return false;
  return 'access_token' in value && typeof value.access_token === 'string' && value.access_token.trim().length > 0
    && 'token_type' in value && typeof value.token_type === 'string' && value.token_type.toLowerCase() === 'bearer'
    && 'expires_in' in value && typeof value.expires_in === 'number' && Number.isFinite(value.expires_in) && value.expires_in > 0
    && (!('scope' in value) || value.scope === undefined || typeof value.scope === 'string')
    && (!('refresh_token' in value) || value.refresh_token === undefined
      || (typeof value.refresh_token === 'string' && value.refresh_token.trim().length > 0));
};

const isAuthUser = (value: unknown): value is AuthUser =>
  typeof value === 'object' && value !== null
  && 'tenantId' in value && typeof value.tenantId === 'string'
  && 'username' in value && typeof value.username === 'string'
  && 'avatarUrl' in value && typeof value.avatarUrl === 'string';

function writeStorage(fields: Record<string, string | undefined>, rememberMe: boolean, isRenewal = false) {
  for (const storage of [localStorage, sessionStorage]) {
    storageKeys.forEach(key => storage.removeItem(key));
    for (const key of ['auth-token-session', 'auth-session', 'auth-tenant-id', 'auth-username', 'auth-avatar-url', 'user']) {
      storage.removeItem(key);
    }
  }
  const storage = rememberMe ? localStorage : sessionStorage;
  try {
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) storage.setItem(key, value);
    }
  } catch (error) {
    clearAuthSession();
    throw error;
  }
  if (!isRenewal) authSessionGeneration++;
  authSessionVersion++;
  listeners.forEach(listener => listener());
}

export const clearAuthSession = () => writeStorage({}, false);

export const saveAuthSession = (tokens: TokenResponse, user: AuthUser, rememberMe: boolean, isRenewal = false): AuthSession => {
  if (!isTokenResponse(tokens)) throw new Error('Invalid authentication token response');
  if (!isAuthUser(user)) throw new Error('Invalid authentication user');
  const session: AuthSession = { ...tokens, expiresAt: Date.now() + tokens.expires_in * 1000, user, rememberMe };
  if (!Number.isFinite(session.expiresAt)) throw new Error('Invalid authentication expiry');
  writeStorage({
    [authStorageKeys.accessToken]: tokens.access_token,
    [authStorageKeys.refreshToken]: tokens.refresh_token,
    [authStorageKeys.tokenType]: tokens.token_type,
    [authStorageKeys.expiresIn]: String(tokens.expires_in),
    [authStorageKeys.expiresAt]: String(session.expiresAt),
    [authStorageKeys.scope]: tokens.scope,
    [authStorageKeys.user]: JSON.stringify(user),
  }, rememberMe, isRenewal);
  return session;
};

export const readAuthSession = (): AuthSession | null => {
  try {
    const storage = [sessionStorage, localStorage].find(item => storageKeys.some(key => item.getItem(key) !== null));
    if (!storage) return null;
    const tokens = {
      access_token: storage.getItem(authStorageKeys.accessToken),
      refresh_token: storage.getItem(authStorageKeys.refreshToken) ?? undefined,
      token_type: storage.getItem(authStorageKeys.tokenType),
      expires_in: Number(storage.getItem(authStorageKeys.expiresIn)),
      scope: storage.getItem(authStorageKeys.scope) ?? undefined,
    };
    const expiresAt = Number(storage.getItem(authStorageKeys.expiresAt));
    const user: unknown = JSON.parse(storage.getItem(authStorageKeys.user) ?? 'null');
    if (!isTokenResponse(tokens) || !Number.isFinite(expiresAt) || expiresAt <= 0 || !isAuthUser(user)) {
      throw new Error('Invalid stored authentication session');
    }
    if (expiresAt <= Date.now() && !tokens.refresh_token) {
      clearAuthSession();
      return null;
    }
    return {
      ...tokens, expiresAt,
      user: { tenantId: user.tenantId, username: user.username, avatarUrl: user.avatarUrl },
      rememberMe: storage === localStorage,
    };
  } catch {
    console.error('Unable to restore authentication session');
    clearAuthSession();
    return null;
  }
};

export const getSessionAccessToken = (): string => {
  const session = readAuthSession();
  return session && session.expiresAt > Date.now() ? session.access_token : '';
};

async function renewSession(session: AuthSession, refreshToken: string, version: number): Promise<string> {
  try {
    const { data } = await requestToken({ grantType: 'refresh_token', refreshToken });
    if (version !== authSessionVersion) throw new Error('Authentication session changed during refresh');
    if (!isTokenResponse(data)) {
      clearAuthSession();
      showMessage({ type: 'error', message: coreI18n.auth.invalidTokenResponse });
      throw new Error(coreI18n.auth.invalidTokenResponse);
    }
    const tokens = { ...data, refresh_token: data.refresh_token ?? session.refresh_token, scope: data.scope ?? session.scope };
    saveAuthSession(tokens, session.user, session.rememberMe, true);
    return tokens.access_token;
  } catch (error) {
    if (version === authSessionVersion) {
      clearAuthSession();
      showMessage({ type: 'warning', message: coreI18n.auth.sessionExpired });
    }
    throw error;
  }
}

export function refreshAccessToken(): Promise<string> {
  const version = authSessionVersion;
  if (pendingRefresh?.version === version) return pendingRefresh.promise;
  const session = readAuthSession();
  if (!session?.refresh_token) {
    clearAuthSession();
    showMessage({ type: 'warning', message: coreI18n.auth.sessionExpired });
    return Promise.reject(new Error(coreI18n.auth.sessionExpired));
  }
  const promise = renewSession(session, session.refresh_token, version).finally(() => {
    if (pendingRefresh?.promise === promise) pendingRefresh = undefined;
  });
  pendingRefresh = { version, promise };
  return promise;
}

export async function ensureAccessToken(): Promise<string> {
  const session = readAuthSession();
  if (!session) return '';
  return session.expiresAt > Date.now() ? session.access_token : refreshAccessToken();
}

export const getAccessToken = ensureAccessToken;

export const getProfile = (): Promise<IApiResponse<unknown>> =>
  ApiRequest.Get(new URL('profile', authTokenEndpoint).href, null);

export const resetPassword = (email: string): Promise<IApiResponse<unknown>> => {
  const url = new URL('forgot-password', authTokenEndpoint);
  url.searchParams.set('email', email);
  return ApiRequest.Post(url.href, null);
};

export interface IAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
  scope?: string;
  tokenType: string;
  user?: AuthUser;
}

export const saveToken = (authData: IAuthData, rememberMe = false) => {
  if (!authData.user) throw new Error('Authentication user is required');
  return saveAuthSession({
    access_token: authData.accessToken,
    refresh_token: authData.refreshToken,
    expires_in: authData.expiresIn,
    scope: authData.scope,
    token_type: authData.tokenType,
  }, authData.user, rememberMe);
};

export type IConnectTokenRequest =
  | { grantType: 'password'; tenantId: string; username: string; password: string }
  | { grantType: 'refresh_token'; refreshToken: string };

const requestToken = (request: IConnectTokenRequest) => axios.request<unknown>({
  method: 'POST',
  url: authTokenEndpoint,
  headers: request.grantType === 'refresh_token'
    ? { 'Content-Type': 'application/x-www-form-urlencoded' }
    : { 'Content-Type': 'application/json; charset=utf-8', grant_type: request.grantType },
  data: request.grantType === 'refresh_token'
    ? new URLSearchParams({ grant_type: request.grantType, refresh_token: request.refreshToken }).toString()
    : { tenantId: request.tenantId, username: request.username, password: request.password },
  timeout: request.grantType === 'refresh_token' ? 3000 : 15000,
});

export const connectToken = async (request: IConnectTokenRequest): Promise<IApiResponse<IAuthData | null>> => {
  let status = 0;
  try {
    const response = await requestToken(request);
    status = response.status;
    const tokens = response.data;
    if (!isTokenResponse(tokens)) throw new Error(coreI18n.auth.invalidTokenResponse);
    let user: AuthUser | undefined;
    if ('user' in tokens && tokens.user !== undefined && tokens.user !== null) {
      const profile = tokens.user;
      if (!isAuthUser(profile)) throw new Error(coreI18n.auth.invalidTokenResponse);
      user = { tenantId: profile.tenantId, username: profile.username, avatarUrl: profile.avatarUrl };
    }
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    if (!Number.isFinite(expiresAt)) throw new Error(coreI18n.auth.invalidTokenResponse);
    return {
      success: true, status, message: '',
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        expiresIn: tokens.expires_in,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        user,
      },
    };
  }
  catch (error: unknown) {
    let message = error instanceof Error ? error.message : coreI18n.auth.authenticationFailed;
    if (axios.isAxiosError<{ error_description?: string }>(error)) {
      status = error.response?.status ?? 0;
      message = error.response?.data?.error_description || coreI18n.auth.authenticationFailed;
    }
    showMessage({
      type: 'error', message,
      title: coreI18n.auth.authenticationFailed,
      displayTime: 4000,
    });
    return { success: false, status, data: null, message };
  }
}
