import axios from 'axios';
import { coreI18n } from '../i18n';
import { showMessage } from '../utils/message-box';
import { ApiRequest, type IApiResponse } from './api';
import { APP_STORAGE_KEYS } from '../constants';

export const authTokenEndpoint = 'https://localhost:7131/api/auth/login';

const listeners = new Set<() => void>();

export interface AuthUser {
  tenantId: string;
  username: string;
  avatarUrl: string;
  rememberMe?: boolean;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
  refreshToken?: string;
}

export interface AuthSession extends TokenResponse {
  expiresAt: number;
}

export interface IAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
  scope?: string;
  tokenType: string;
  user?: AuthUser;
}

export type IConnectTokenRequest =
  | { grantType: 'password'; tenantId: string; username: string; password: string, rememberMe: boolean }
  | { grantType: 'refresh_token'; refreshToken: string };

export const subscribeAuthSession = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const saveLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, value);
};

export const deleteLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

export const readLocalStorage = (key:string): any | null => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return value;
  } catch {
    return null;
  }
};

export const isTokenResponse = (value: any): boolean => {

  if (typeof value !== 'object' || value === null) return false;

  var accessToken = value[APP_STORAGE_KEYS.accessToken];
  var tokenType = value[APP_STORAGE_KEYS.tokenType];
  var expiresIn = value[APP_STORAGE_KEYS.expiresIn];
  var refreshToken = value[APP_STORAGE_KEYS.refreshToken];
  var scope = value[APP_STORAGE_KEYS.scope];
  var res = typeof accessToken === 'string' && accessToken.length > 0
    && typeof tokenType === 'string' && tokenType.length > 0
    && typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0
    && (refreshToken === undefined || (typeof refreshToken === 'string' && refreshToken.length > 0))
    && (scope === undefined || (typeof scope === 'string' && scope.length > 0));

  return res;
}

export const clearAuthSession = () => {
  deleteLocalStorage(APP_STORAGE_KEYS.accessToken);
  deleteLocalStorage(APP_STORAGE_KEYS.refreshToken);
  deleteLocalStorage(APP_STORAGE_KEYS.tokenType);
  deleteLocalStorage(APP_STORAGE_KEYS.expiresIn);
  deleteLocalStorage(APP_STORAGE_KEYS.expiresAt);
  deleteLocalStorage(APP_STORAGE_KEYS.scope);
  notifySubscribers();
};

export const readAuthSession = (): AuthSession | null => {
  try {
    const storage = readLocalStorage(APP_STORAGE_KEYS.accessToken) !== null ? localStorage : null;
    if (!storage) return null;

    const accessToken_ = readLocalStorage(APP_STORAGE_KEYS.accessToken);
    const tokenType_ = readLocalStorage(APP_STORAGE_KEYS.tokenType);
    const expiresIn_ = Number(readLocalStorage(APP_STORAGE_KEYS.expiresIn));
    const expiresAt_ = Number(readLocalStorage(APP_STORAGE_KEYS.expiresAt));
    const refreshToken_ = readLocalStorage(APP_STORAGE_KEYS.refreshToken) ?? undefined;
    const scope_ = readLocalStorage(APP_STORAGE_KEYS.scope) ?? undefined;

    var _isTokenResponse = isTokenResponse({ 
      [APP_STORAGE_KEYS.accessToken]: accessToken_ ?? '',
      [APP_STORAGE_KEYS.tokenType]: tokenType_ ?? '',
      [APP_STORAGE_KEYS.expiresIn]: expiresIn_ ?? 0,
      [APP_STORAGE_KEYS.expiresAt]: expiresAt_ ?? 0,
      [APP_STORAGE_KEYS.refreshToken]: refreshToken_,
      [APP_STORAGE_KEYS.scope]: scope_
    })

    if ( !_isTokenResponse || !Number.isFinite(expiresAt_) || expiresAt_ <= 0 ) {
      clearAuthSession();
      return null;
    }

    return {
      accessToken: accessToken_ ?? '',
      tokenType: tokenType_ ?? '',
      expiresIn: expiresIn_ ?? 0,
      refreshToken: refreshToken_,
      scope: scope_,
      expiresAt: expiresAt_,
    };
  } catch {
    clearAuthSession();
    return null;
  }
};

export const connectToken = async (request: IConnectTokenRequest): Promise<IApiResponse> => {
  let status = 0;
  try {
    const response = await requestToken(request);
    status = response.status;
    const tokenData: any = response.data;
    if (!isTokenResponse(tokenData)) throw new Error(coreI18n.auth.invalidTokenResponse);
    
    if (typeof tokenData !== 'object' || tokenData === null) throw new Error(coreI18n.auth.invalidTokenResponse);

    const expiresAt = Date.now() + tokenData[APP_STORAGE_KEYS.expiresIn] * 1000;

    if (!Number.isFinite(expiresAt)) throw new Error(coreI18n.auth.invalidTokenResponse);

    var sessionData ={
        accessToken: tokenData[APP_STORAGE_KEYS.accessToken],
        refreshToken: tokenData[APP_STORAGE_KEYS.refreshToken],
        expiresAt,
        expiresIn: tokenData[APP_STORAGE_KEYS.expiresIn],
        scope: tokenData[APP_STORAGE_KEYS.scope],
        tokenType: tokenData[APP_STORAGE_KEYS.tokenType],
    };

    saveSessionData(sessionData);
    
    return {
      success: true,
      status,
      message: '',
      data: sessionData,
      
    };
  } catch (error: unknown) {
    let message = error instanceof Error ? error.message : coreI18n.auth.authenticationFailed;
    if (axios.isAxiosError<{ error_description?: string }>(error)) {
      status = error.response?.status ?? 0;
      message = error.response?.data?.error_description || coreI18n.auth.authenticationFailed;
    }
    showMessage({
      type: 'error',
      message,
      title: coreI18n.auth.authenticationFailed,
      displayTime: 4000,
    });
    return { success: false, status, data: null, message };
  }
};

export const refreshSession = async (): Promise<string> => {
  const session = readAuthSession();
  if (!session?.refreshToken) {
    clearAuthSession();
    throw new Error(coreI18n.auth.sessionExpired);
  }

  try {
    const response = await connectToken({ grantType: 'refresh_token', refreshToken: session.refreshToken });
    const data :any = response.data;
    return data.accessToken;
  } catch {
    clearAuthSession();
    showMessage({ type: 'warning', message: coreI18n.auth.sessionExpired });
    throw new Error(coreI18n.auth.sessionExpired);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  const session = readAuthSession();
  if (!session) {
    redirectToLoginPreservingPath();
    return null;
  }
  if (session.expiresAt > Date.now()) return session.accessToken;
  try {
    return await refreshSession();
  } catch {
    redirectToLoginPreservingPath();
    return null;
  }
};

export const resetPassword = (email: string): Promise<IApiResponse> => {
  const url = new URL('forgot-password', authTokenEndpoint);
  url.searchParams.set('email', email);
  return ApiRequest.Post(url.href, null);
};

const notifySubscribers = () => {
  listeners.forEach(listener => listener());
};

const getCurrentPath = (): string => {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash || '#/';
  const path = hash.startsWith('#') ? hash.slice(1) : hash;
  return path.startsWith('/') ? path : `/${path}`;
};

const isAuthPage = (path: string): boolean => path === '/login' || path.startsWith('/login?') || path === '/reset-password' || path.startsWith('/reset-password?');

const redirectToLoginPreservingPath = () => {
  if (typeof window === 'undefined') return;
  const path = getCurrentPath();
  if (!isAuthPage(path)) {
    sessionStorage.setItem(APP_STORAGE_KEYS.authRedirectPathKey, path);
  }
  const loginHash = '#/login';
  if (window.location.hash !== loginHash) {
    window.location.reload();
  }
};

const restorePathAfterLogin = () => {
  if (typeof window === 'undefined') return;
  const currentPath = getCurrentPath();
  if (!currentPath.startsWith('/login')) return;
  const redirectPath = sessionStorage.getItem(APP_STORAGE_KEYS.authRedirectPathKey);
  if (!redirectPath || !redirectPath.startsWith('/')) return;
  sessionStorage.removeItem(APP_STORAGE_KEYS.authRedirectPathKey);
  window.location.replace(`${window.location.pathname}${window.location.search}#${redirectPath}`);
};

const saveSessionData = (sessionData: AuthSession) => {
  
  clearAuthSession();
  
  saveLocalStorage(APP_STORAGE_KEYS.accessToken,  sessionData.accessToken);
  saveLocalStorage(APP_STORAGE_KEYS.tokenType,    sessionData.tokenType);
  saveLocalStorage(APP_STORAGE_KEYS.expiresIn,    sessionData.expiresIn);
  saveLocalStorage(APP_STORAGE_KEYS.expiresAt,    sessionData.expiresAt);

  if (sessionData.refreshToken) saveLocalStorage(APP_STORAGE_KEYS.refreshToken, sessionData.refreshToken);
  if (sessionData.scope) saveLocalStorage(APP_STORAGE_KEYS.scope, sessionData.scope);

  notifySubscribers();
  restorePathAfterLogin();
  
};

const requestToken = (request: IConnectTokenRequest) => axios.request<unknown>({
  method: 'POST',
  url: authTokenEndpoint,
  headers: request.grantType === 'refresh_token'
    ? { 'Content-Type': 'application/x-www-form-urlencoded' }
    : { 'Content-Type': 'application/json; charset=utf-8', grant_type: request.grantType },
  data: request.grantType === 'refresh_token'
    ? new URLSearchParams({ grant_type: request.grantType, refresh_token: request.refreshToken }).toString()
    : { tenantId: request.tenantId, username: request.username, password: request.password },
  timeout: request.grantType === 'refresh_token' ? 3000 : 10000,
});

