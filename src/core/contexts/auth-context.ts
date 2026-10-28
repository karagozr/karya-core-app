import React, { useState, useEffect, useCallback } from 'react';
import { ApiRequest, connectToken, type IApiResponse } from '../services';
import { clearAuthSession, readAuthSession,
  readLocalStorage,
  saveLocalStorage,
  subscribeAuthSession, type AuthUser} from '../services/auth';
import { coreI18n } from '../i18n';
import { showMessage } from '../utils/message-box';
import { APP_STORAGE_KEYS } from '../constants';

export type User = AuthUser;

export type AuthContextType = {
  loading: boolean;
    user?: User;
    session?: any;
    signIn: (tenantId: string, username: string, password: string, rememberMe: boolean)=> Promise<IApiResponse<User | null>>;
    signOut: () => void;
    updateUserProfile: (profileData: Partial<User>) => Promise<IApiResponse<User>>;
}

const messageBoxDefaults = {
  isActiveError: true,
  isActiveSuccess: true,
  isActiveWarning: true,
  isActiveInfo: true
};

export const fetchUserProfile: (url: string) => Promise<User | undefined> = async (url: string) => {
  if (!readAuthSession()) return undefined;
  var result = await ApiRequest.Get(url,null,messageBoxDefaults);
  if (result.success) {
    saveLocalStorage(APP_STORAGE_KEYS.user, JSON.stringify(result.data.user));
    Object.keys(result.data.claims).forEach(key => {
      if(key==="themeId") saveLocalStorage(APP_STORAGE_KEYS.themeId, result.data.claims[key]??'light');
      if(key==="languageId") saveLocalStorage(APP_STORAGE_KEYS.languageId, result.data.claims[key]??'tr');
      saveLocalStorage(key, result.data.claims[key]);
    });
  }

  return {
    ...result.data
  };
};

export const getUserProfile = () => {
  var res = readLocalStorage(APP_STORAGE_KEYS.user);
  try {
    var user = JSON.parse(res);
    if (user && typeof user === 'object' && 'tenantId' in user && 'username' in user) {
      return user as User;
    }
  } catch {
    return undefined;
  }
};


export const useProvideAuthContext = ():AuthContextType => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>(getUserProfile());
  const [session, setSession] = useState(readAuthSession());

  const setUserProfile = (profile: any|undefined) => {
    if(!profile || !profile.user) {
      setUser(undefined);
      return;
    }
    setUser(profile?.user);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await fetchUserProfile('https://localhost:7131/api/AppProfile');
      console.log("Fetched profile:", profile);
      setUserProfile(profile);
    };
    fetchProfile();
  }, []);


  

  const signIn = useCallback(async (tenantId: string, username: string, password: string, rememberMe: boolean) => {
    const result = await connectToken({ tenantId, username, password, grantType: 'password', rememberMe });
    
    if (!result.success || !result.data) showMessage({ type: 'error', message: coreI18n.auth.authenticationFailed });

    try {
      if(rememberMe) {
        saveLocalStorage(APP_STORAGE_KEYS.authUsername, username);
        saveLocalStorage(APP_STORAGE_KEYS.authTenantId, tenantId);
        saveLocalStorage(APP_STORAGE_KEYS.authRememberMe, true);
      }
      setSession(result.data);
      return { ...result };
    } catch {
      showMessage({ type: 'error', message: coreI18n.auth.authenticationFailed });
      return { ...result, success: false, data: null, message: coreI18n.auth.authenticationFailed };
    }
  }, []);

  const signOut = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  const updateUserProfile = useCallback(async (profileData: Partial<User>) => {
    
    const result = await ApiRequest.Post('/auth/profile', profileData, messageBoxDefaults);

    if (result.success) {
      setUser(prevUser => ({
        ...prevUser,
        ...profileData
      } as User));
    }
    return result;
  }, []);


  return ({
    loading,
    session,
    user,
    signIn,
    signOut,
    updateUserProfile
  });
}

type AuthContextValue = ReturnType<typeof useProvideAuthContext>;

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export const useAuthContext = () => {
    const context = React.useContext(AuthContext);

    if (!context) {
        throw new Error('useAuthContext must be used within AuthContext.Provider');
    }

    return context;
};
