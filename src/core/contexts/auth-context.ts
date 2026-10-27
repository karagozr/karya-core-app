import React, { useState, useEffect, useCallback } from 'react';
import { ApiRequest, connectToken, type IApiResponse } from '../services';
import { clearAuthSession, readAuthSession,
  subscribeAuthSession, type AuthUser } from '../services/auth';
import { coreI18n } from '../i18n';
import { showMessage } from '../utils/message-box';

export type User = AuthUser;

export type AuthContextType = {
    session?: ReturnType<typeof readAuthSession>;
    user?: User;
    signIn: (tenantId: string, username: string, password: string, rememberMe: boolean)=> Promise<IApiResponse<User | null>>;
    signOut: () => void;
    loading: boolean;
    updateUserProfile: (profileData: Partial<User>) => Promise<IApiResponse<User>>;
}

const messageBoxDefaults = {
  isActiveError: true,
  isActiveSuccess: true,
  isActiveWarning: true,
  isActiveInfo: true
};

export const useProvideAuthContext = ():AuthContextType => {
  const [session, setSession] = useState(readAuthSession);
  const [user, setUser] = useState<User | undefined>(session?.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscribeAuthSession(() => {
      const current = readAuthSession();
      
      setSession(current);
      setUser(current?.user);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (tenantId: string, username: string, password: string, rememberMe: boolean) => {
    const result = await connectToken({ tenantId, username, password, grantType: 'password', rememberMe });
    
    if (!result.success || !result.data) showMessage({ type: 'error', message: '->'+coreI18n.auth.authenticationFailed });
    const signedInUser: User = result.data.user ?? null;
    try {
      setUser(signedInUser);
      return { ...result, data: signedInUser };
    } catch {
      showMessage({ type: 'error', message: coreI18n.auth.authenticationFailed });
      return { ...result, success: false, data: null, message: coreI18n.auth.authenticationFailed };
    }
  }, []);

  const signOut = useCallback(() => {
    clearAuthSession();
    setUser(undefined);
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
    session,
    user,
    signIn,
    signOut,
    loading,
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
