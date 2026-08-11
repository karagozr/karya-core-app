import React, { useState, useEffect, useCallback, createContext } from 'react';
import {
  clearPersistedAuth,
  getUser,
  signIn as sendSignInRequest,
  updateProfile as sendUpdateProfileRequest,
} from '../services/auth';
import type { User, AuthContextType, UserUpdatePayload } from '../../types';

const AuthContext = createContext<AuthContextType>({ loading: false } as AuthContextType);

function AuthProvider(props: React.PropsWithChildren<unknown>) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      const result = await getUser();
      if (result.isOk) {
        setUser(result.data);
      }

      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const result = await sendSignInRequest(username, password);
    if (result.isOk) {
      setUser(result.data);
    }

    return result;
  }, []);

  const updateUserProfile = useCallback(async (payload: UserUpdatePayload) => {
    const result = await sendUpdateProfileRequest(payload);

    if (result.isOk) {
      setUser(result.data);
    }

    return result;
  }, []);

  const signOut = useCallback(() => {
    clearPersistedAuth();
    setUser(undefined);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, updateUserProfile, signOut, loading }} {...props} />
  );
}

export {
  AuthProvider,
  AuthContext,
};