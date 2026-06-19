import { create } from 'zustand';
import { api } from '@/lib/axios';
import type { RegisterData, User } from '@/types/auth';

type AccountType = 'user' | 'admin';

const REMEMBER_LOGIN_STORAGE_KEY = 'copypro_remember_login_30_days';
const DEFAULT_REMEMBER_LOGIN = true;

interface AuthApiResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: User;
    requiresEmailVerification?: boolean;
    expiresInSeconds?: number;
    alreadyVerified?: boolean;
  };
}

interface RegisterResult {
  requiresEmailVerification?: boolean;
  expiresInSeconds?: number;
}

interface ResendVerificationResult {
  expiresInSeconds?: number;
  alreadyVerified?: boolean;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getRememberLoginPreference() {
  if (!canUseStorage()) return DEFAULT_REMEMBER_LOGIN;

  const savedValue = localStorage.getItem(REMEMBER_LOGIN_STORAGE_KEY);
  if (savedValue === null) return DEFAULT_REMEMBER_LOGIN;

  return savedValue === 'true';
}

function saveRememberLoginPreference(rememberLogin: boolean) {
  if (!canUseStorage()) return;
  localStorage.setItem(REMEMBER_LOGIN_STORAGE_KEY, String(rememberLogin));
}

function saveSession(user: User) {
  if (!canUseStorage()) return;
  localStorage.removeItem('auth_token');
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

function accountTypeFromUser(user: User | null): AccountType {
  return user?.role === 'admin' ? 'admin' : 'user';
}

function getStoredUser() {
  if (!canUseStorage()) return null;

  const savedUserRaw = localStorage.getItem('user');
  if (!savedUserRaw) return null;

  try {
    return JSON.parse(savedUserRaw) as User;
  } catch {
    return null;
  }
}

function getHydrationOrder(savedUser: User | null): AccountType[] {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const preferred = path.startsWith('/admin') ? 'admin' : accountTypeFromUser(savedUser);
  return preferred === 'admin' ? ['admin', 'user'] : ['user', 'admin'];
}

async function fetchCurrentUser(accountType: AccountType) {
  try {
    const response = await api.get<AuthApiResponse>(`/auth/${accountType}/me`);
    return response.data.data?.user ?? null;
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, accountType?: AccountType, rememberLogin?: boolean) => Promise<User>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<ResendVerificationResult>;
  updateUser: (user: User) => void;
  updateRememberLogin: (rememberLogin: boolean, accountType?: AccountType) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  hydrate: async () => {
    if (!canUseStorage()) {
      set({ isLoading: false });
      return;
    }

    const savedUser = getStoredUser();

    for (const accountType of getHydrationOrder(savedUser)) {
      const hydratedUser = await fetchCurrentUser(accountType);
      if (hydratedUser) {
        saveSession(hydratedUser);
        set({ user: hydratedUser, isLoading: false });
        return;
      }
    }

    clearSession();
    set({ user: null, isLoading: false });
  },

  login: async (email, password, accountType = 'user', rememberLogin = getRememberLoginPreference()) => {
    try {
      const response = await api.post<AuthApiResponse>(`/auth/${accountType}/login`, {
        email,
        password,
        rememberLogin,
      });

      const user = response.data.data?.user;

      if (!user) {
        throw new Error('Invalid auth response');
      }

      saveRememberLoginPreference(rememberLogin);
      saveSession(user);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Email hoac mat khau khong dung'));
    }
  },

  register: async (data) => {
    try {
      const response = await api.post<AuthApiResponse>('/auth/user/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      return {
        requiresEmailVerification: response.data.data?.requiresEmailVerification,
        expiresInSeconds: response.data.data?.expiresInSeconds,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Dang ky that bai'));
    }
  },

  verifyEmail: async (email, otp) => {
    try {
      await api.post<AuthApiResponse>('/auth/user/verify-email', { email, otp });
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Xac thuc email that bai'));
    }
  },

  resendEmailVerification: async (email) => {
    try {
      const response = await api.post<AuthApiResponse>('/auth/user/resend-verification', { email });
      return {
        expiresInSeconds: response.data.data?.expiresInSeconds,
        alreadyVerified: response.data.data?.alreadyVerified,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Khong gui lai duoc ma xac thuc'));
    }
  },

  updateUser: (user) => {
    saveSession(user);
    set({ user, isLoading: false });
  },

  updateRememberLogin: async (rememberLogin, accountType) => {
    const currentUser = get().user ?? getStoredUser();

    if (!currentUser) {
      saveRememberLoginPreference(rememberLogin);
      return;
    }

    const resolvedAccountType = accountType ?? accountTypeFromUser(currentUser);

    try {
      const response = await api.patch<AuthApiResponse>(`/auth/${resolvedAccountType}/session`, {
        rememberLogin,
      });

      const updatedUser = response.data.data?.user ?? currentUser;
      saveRememberLoginPreference(rememberLogin);
      saveSession(updatedUser);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Khong the cap nhat ghi nho dang nhap'));
    }
  },

  logout: async () => {
    const currentUser = get().user ?? getStoredUser();
    const accountType = accountTypeFromUser(currentUser);

    try {
      await api.post(`/auth/${accountType}/logout`);
    } catch {
      // Local logout must always finish even if the backend is unreachable.
    } finally {
      clearSession();
      set({ user: null, isLoading: false });
    }
  },
}));
