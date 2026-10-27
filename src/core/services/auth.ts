import axios from 'axios';
import { coreI18n } from '../i18n';
import { showMessage } from '../utils/message-box';
import { ApiRequest, type IApiResponse } from './api';

export const authTokenEndpoint = 'https://localhost:7131/api/auth/login';

export const authStorageKeys = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  tokenType: 'token_type',
  expiresIn: 'expires_in',
  expiresAt: 'expires_at',
  scope: 'scope',
  user: 'user',
  rememberMe: 'remember_me',
  claims: 'claims'
};

const listeners = new Set<() => void>();
const authRedirectPathKey = 'auth-redirect-path';

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
  user: AuthUser;
  rememberMe: boolean;
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

export const isTokenResponse = (value: any): boolean => {

  if (typeof value !== 'object' || value === null) return false;

  var accessToken = value[authStorageKeys.accessToken];
  var tokenType = value[authStorageKeys.tokenType];
  var expiresIn = value[authStorageKeys.expiresIn];
  var refreshToken = value[authStorageKeys.refreshToken];
  var scope = value[authStorageKeys.scope];

  var res = typeof accessToken === 'string' && accessToken.length > 0
    && typeof tokenType === 'string' && tokenType.length > 0
    && typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0
    && (refreshToken === undefined || (typeof refreshToken === 'string' && refreshToken.length > 0))
    && (scope === undefined || (typeof scope === 'string' && scope.length > 0));

  return res;
}

const isAuthUser = (value: unknown): value is AuthUser =>
  typeof value === 'object' && value !== null
  && 'tenantId' in value && typeof value.tenantId === 'string'
  && 'username' in value && typeof value.username === 'string'
  && 'avatarUrl' in value && typeof value.avatarUrl === 'string';

const notifySubscribers = () => {
  listeners.forEach(listener => listener());
};

const clearSessionData = () => {
  for (const storage of [localStorage, sessionStorage]) {
    var deleteItem =Object.values(authStorageKeys).filter(key => key!==authStorageKeys.rememberMe && key!==authStorageKeys.user);
    deleteItem.forEach(key => storage.removeItem(key));
  }
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
    sessionStorage.setItem(authRedirectPathKey, path);
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
  const redirectPath = sessionStorage.getItem(authRedirectPathKey);
  if (!redirectPath || !redirectPath.startsWith('/')) return;
  sessionStorage.removeItem(authRedirectPathKey);
  window.location.replace(`${window.location.pathname}${window.location.search}#${redirectPath}`);
};

export const saveUserProfile = (user: any,claims: Array<any>) => {
  localStorage.setItem(authStorageKeys.user, JSON.stringify(user));
  localStorage.setItem(authStorageKeys.claims, JSON.stringify(claims));
  notifySubscribers();
};



export const readUserProfile = (): any | null => {
  try {
    const userValue = localStorage.getItem(authStorageKeys.user);
    if (!userValue) return null;
    return JSON.parse(userValue);
  } catch {
    return null;
  }
};

const saveSessionData = (sessionData: AuthSession) => {
  
  clearSessionData();
  
  localStorage.setItem(authStorageKeys.accessToken,  sessionData.accessToken);
  localStorage.setItem(authStorageKeys.tokenType,    sessionData.tokenType);
  localStorage.setItem(authStorageKeys.expiresIn,    String(sessionData.expiresIn));
  localStorage.setItem(authStorageKeys.expiresAt,    String(sessionData.expiresAt));
  localStorage.setItem(authStorageKeys.user,         JSON.stringify(sessionData.user));
  localStorage.setItem(authStorageKeys.rememberMe, String(sessionData.rememberMe));

  if (sessionData.refreshToken) localStorage.setItem(authStorageKeys.refreshToken, sessionData.refreshToken);
  if (sessionData.scope) localStorage.setItem(authStorageKeys.scope, sessionData.scope);

  notifySubscribers();
  restorePathAfterLogin();
  
};

export const clearAuthSession = () => {
  clearSessionData();
  notifySubscribers();
};

export const readAuthSession = (): AuthSession | null => {
  try {
    const storage = localStorage.getItem(authStorageKeys.accessToken) !== null ? localStorage : null;
    if (!storage) return null;

    const accessToken_ = storage.getItem(authStorageKeys.accessToken);
    const tokenType_ = storage.getItem(authStorageKeys.tokenType);
    const expiresIn_ = Number(storage.getItem(authStorageKeys.expiresIn));
    const expiresAt_ = Number(storage.getItem(authStorageKeys.expiresAt));
    const refreshToken_ = storage.getItem(authStorageKeys.refreshToken) ?? undefined;
    const scope_ = storage.getItem(authStorageKeys.scope) ?? undefined;
    const userValue_: unknown = JSON.parse(storage.getItem(authStorageKeys.user) ?? 'null');

    const tokenData = { 
      [authStorageKeys.accessToken]: accessToken_ ?? '',
      [authStorageKeys.tokenType]: tokenType_ ?? '',
      [authStorageKeys.expiresIn]: expiresIn_ ?? 0,
      [authStorageKeys.expiresAt]: expiresAt_ ?? 0,
      [authStorageKeys.refreshToken]: refreshToken_,
      [authStorageKeys.scope]: scope_
    };


    if (!isTokenResponse(tokenData) || !Number.isFinite(expiresAt_) || expiresAt_ <= 0 || !isAuthUser(userValue_)) {
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
      user: userValue_,
      rememberMe: false,
    };
  } catch {
    clearAuthSession();
    return null;
  }
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

export const connectToken = async (request: IConnectTokenRequest): Promise<IApiResponse> => {
  let status = 0;
  try {
    const response = await requestToken(request);
    status = response.status;
    const tokenData: any = response.data;
    if (!isTokenResponse(tokenData)) throw new Error(coreI18n.auth.invalidTokenResponse);
    
    let user: AuthUser ={
      tenantId: request.grantType === 'password' ? request.tenantId : readAuthSession()?.user?.tenantId ?? '',
      username: request.grantType === 'password' ? request.username : readAuthSession()?.user?.username ?? '',
      avatarUrl: ''
    }

    if (typeof tokenData !== 'object' || tokenData === null) throw new Error(coreI18n.auth.invalidTokenResponse);

    const expiresAt = Date.now() + tokenData[authStorageKeys.expiresIn] * 1000;

    if (!Number.isFinite(expiresAt)) throw new Error(coreI18n.auth.invalidTokenResponse);

    var sessionData ={
        accessToken: tokenData[authStorageKeys.accessToken],
        refreshToken: tokenData[authStorageKeys.refreshToken],
        expiresAt,
        expiresIn: tokenData[authStorageKeys.expiresIn],
        scope: tokenData[authStorageKeys.scope],
        tokenType: tokenData[authStorageKeys.tokenType],
        user,
    };

    saveSessionData({
      ...sessionData,
      rememberMe: request.grantType === 'password' ? request.rememberMe : localStorage.getItem('rememberMe')==='true',
    });
    
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

export const getSessionAccessToken = (): string => {
  const session = readAuthSession();
  return session && session.expiresAt > Date.now() ? session.accessToken : '';
};

export const resetPassword = (email: string): Promise<IApiResponse> => {
  const url = new URL('forgot-password', authTokenEndpoint);
  url.searchParams.set('email', email);
  return ApiRequest.Post(url.href, null);
};

