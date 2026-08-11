import type { User, UserUpdatePayload } from '../../types';
import { coreI18n } from '../i18n';

const ACCESS_TOKEN_STORAGE_KEY = 'access-token';
const AUTH_SESSION_STORAGE_KEY = 'auth-session';

const mockUser: User = {
  token: 'mock-jwt-token-admin',
  profile: {
    username: 'admin',
    fullName: 'System Administrator',
    email: 'admin@example.com',
    avatarUrl: 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/06.png'
  },
  pagePermissions: [
    '/home',
    '/profile',
    '/tasks/list',
    '/inventory/list',
    '/inventory/form',
    '/inventory/report',
    '/inventory-category/list',
    '/inventory-main-category/list'
  ],
  language: 'tr-TR',
  theme: 'light'
};

const persistAuth = (user: User) => {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, JSON.stringify({ token: user.token }));
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
};

const readPersistedSession = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const clearPersistedAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
};

export async function signIn(username: string, password: string) {
  try {
    if (username === 'admin' && password === '123') {
      persistAuth(mockUser);
      return {
        isOk: true,
        data: mockUser
      };
    }

    return {
      isOk: false,
      message: coreI18n.auth.invalidCredentials
    };
  }
  catch {
    return {
      isOk: false,
      message: coreI18n.auth.authenticationFailed
    };
  }
}

export async function getUser() {
  try {
    const tokenRaw = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const sessionRaw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!tokenRaw || !sessionRaw) {
      return {
        isOk: false
      };
    }

    const tokenObj = JSON.parse(tokenRaw) as { token?: string };
    const session = JSON.parse(sessionRaw) as User;

    if (!tokenObj?.token || !session?.token) {
      clearPersistedAuth();
      return {
        isOk: false
      };
    }

    return {
      isOk: true,
      data: session
    };
  }
  catch {
    clearPersistedAuth();
    return {
      isOk: false
    };
  }
}

export async function updateProfile(payload: UserUpdatePayload) {
  try {
    const session = readPersistedSession();

    if (!session) {
      return {
        isOk: false,
        message: coreI18n.auth.noActiveSession
      };
    }

    const updatedUser: User = {
      ...session,
      ...payload,
      profile: {
        ...session.profile,
        ...(payload.profile ?? {})
      },
      pagePermissions: payload.pagePermissions ?? session.pagePermissions,
      language: payload.language ?? session.language,
      theme: payload.theme ?? session.theme,
    };

    persistAuth(updatedUser);

    return {
      isOk: true,
      data: updatedUser
    };
  }
  catch {
    return {
      isOk: false,
      message: coreI18n.auth.profileUpdateFailed
    };
  }
}

export async function createAccount(email: string, password: string) {
  try {
    console.log(email, password);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: coreI18n.auth.createAccountFailed
    };
  }
}

export async function changePassword(email: string, recoveryCode?: string) {
  try {
    console.log(email, recoveryCode);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: coreI18n.auth.changePasswordFailed
    };
  }
}

export async function resetPassword(email: string) {
  try {
    console.log(email);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: coreI18n.auth.resetPasswordFailed
    };
  }
}