import React, { useState, useEffect, useCallback } from 'react';
import { accessTokenKey, ApiRequest, type IApiResponse } from '../services';

export interface User {
    tenantId: string;
    username: string;
    avatarUrl: string;
}

export type AuthContextType = {
    user?: User;
    signIn: (tenantId: string, username: string, password: string, rememberMe: boolean)=> Promise<IApiResponse<User>>;
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
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      const result = await ApiRequest.Get( '/auth/profile', user,messageBoxDefaults );
      if (result.success) {
        setUser(result.data);
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (tenantId: string, username: string, password: string, rememberMe: boolean) => {
    const result = await ApiRequest.Post('https://localhost:7131/api/auth/login', { tenantId, userName: username, password }, messageBoxDefaults);
    console.log('signIn result:', result);
    if (result.success) {
      localStorage.setItem(accessTokenKey , result.data.access_token);
    }
    return result;
  }, []);

  const signOut = useCallback(() => {
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

