import React, { useState, useEffect, useCallback } from 'react';
import { ApiRequest, connectToken, type IApiResponse } from '../services';
import { clearAuthSession, fetchUserProfile, getUserProfile, readAuthSession,
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
      if(loading === false) {
        const profile = await fetchUserProfile('https://localhost:7131/api/AppProfile/basic');
        console.log("Fetched profile:", profile);
        setUserProfile(profile);
      }
    };
    fetchProfile();
  }, [loading]);


  

  const signIn = useCallback(async (tenantId: string, username: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    const result = await connectToken({ tenantId, username, password, grantType: 'password', rememberMe });
    
    if (!result.success || !result.data) showMessage({ type: 'error', message: coreI18n.auth.authenticationFailed });

    try {
      if(rememberMe) {
        saveLocalStorage(APP_STORAGE_KEYS.authUsername, username);
        saveLocalStorage(APP_STORAGE_KEYS.authTenantId, tenantId);
        saveLocalStorage(APP_STORAGE_KEYS.authRememberMe, true);
      }
      setSession(result.data);
      setLoading(false);
      return { ...result };
    } catch {
      setLoading(false);
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
