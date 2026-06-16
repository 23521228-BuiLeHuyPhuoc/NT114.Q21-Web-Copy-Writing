import { create } from 'zustand';
import { api } from '@/lib/axios';
import type { RegisterData, User } from '@/types/auth';

type AccountType = 'user' | 'admin';

interface AuthApiResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: User;
  };
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function saveSession(user: User) {
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
  login: (email: string, password: string, accountType?: AccountType) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (user: User) => void;
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

  login: async (email, password, accountType = 'user') => {
    try {
      const response = await api.post<AuthApiResponse>(`/auth/${accountType}/login`, {
        email,
        password,
      });

      const user = response.data.data?.user;

      if (!user) {
        throw new Error('Invalid auth response');
      }

      saveSession(user);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Email hoac mat khau khong dung'));
    }
  },

  register: async (data) => {
    try {
      await api.post<AuthApiResponse>('/auth/user/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Dang ky that bai'));
    }
  },

  updateUser: (user) => {
    saveSession(user);
    set({ user, isLoading: false });
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
