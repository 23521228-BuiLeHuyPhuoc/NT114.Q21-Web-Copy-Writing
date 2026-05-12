import { create } from 'zustand';
import {
  ADMIN_INVITE_CODE,
  type RegisterData,
  type StoredUser,
  type User,
  type UserStatus,
} from '@/types/auth';

const INITIAL_MOCK_USERS: StoredUser[] = [
  { id: '1', email: 'admin@copypro.vn',    password: 'admin123',    name: 'Admin CopyPro',     role: 'admin',    adminRole: 'super_admin',     status: 'active',  createdAt: '2025-01-01' },
  { id: '2', email: 'customer@copypro.vn', password: 'customer123', name: 'Nguyễn Văn A',      role: 'customer',                              status: 'active',  createdAt: '2025-03-01' },
  { id: '3', email: 'content@copypro.vn',  password: 'content123',  name: 'Trần Thị Content',  role: 'admin',    adminRole: 'content_manager', status: 'active',  createdAt: '2025-06-01' },
  { id: '4', email: 'users@copypro.vn',    password: 'users123',    name: 'Lê Văn User',       role: 'admin',    adminRole: 'user_manager',    status: 'active',  createdAt: '2025-06-01' },
  { id: '5', email: 'finance@copypro.vn',  password: 'finance123',  name: 'Phạm Thị Finance',  role: 'admin',    adminRole: 'finance_manager', status: 'active',  createdAt: '2025-06-01' },
  { id: '6', email: 'ai@copypro.vn',       password: 'ai123',       name: 'Hoàng Văn AI',      role: 'admin',    adminRole: 'ai_engineer',     status: 'active',  createdAt: '2025-06-01' },
  { id: '7', email: 'analyst@copypro.vn',  password: 'analyst123',  name: 'Ngô Thị Analyst',   role: 'admin',    adminRole: 'analyst',         status: 'active',  createdAt: '2025-06-01' },
  { id: '8', email: 'pending1@copypro.vn', password: 'pending123',  name: 'Vũ Thị Pending',    role: 'admin',    adminRole: 'content_manager', status: 'pending', createdAt: '2026-03-20' },
  { id: '9', email: 'pending2@copypro.vn', password: 'pending123',  name: 'Đặng Văn Chờ',      role: 'admin',    adminRole: 'analyst',         status: 'pending', createdAt: '2026-03-22' },
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('mock_users');
    return raw ? JSON.parse(raw) : [...INITIAL_MOCK_USERS];
  } catch {
    return [...INITIAL_MOCK_USERS];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem('mock_users', JSON.stringify(users));
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  addUser: (data: Omit<StoredUser, 'id' | 'createdAt'> & { createdAt?: string }) => StoredUser;
  approveAdmin: (id: string) => void;
  rejectAdmin: (id: string) => void;
  updateUser: (id: string, updates: Partial<Omit<StoredUser, 'id' | 'password' | 'createdAt'>>) => void;
  getPendingAdmins: () => StoredUser[];
  getAllUsers: () => StoredUser[];
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  hydrate: () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) set({ user: JSON.parse(savedUser) });
    if (!localStorage.getItem('mock_users')) {
      saveStoredUsers(INITIAL_MOCK_USERS);
    }
    set({ isLoading: false });
  },

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 500));
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error('Email hoặc mật khẩu không đúng');
    if (found.status === 'pending') throw new Error('__PENDING__');
    if (found.status === 'rejected') {
      throw new Error('Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên.');
    }
    const { password: _, ...rest } = found;
    const loggedIn = rest as User;
    set({ user: loggedIn });
    localStorage.setItem('user', JSON.stringify(loggedIn));
  },

  register: async (data) => {
    await new Promise((r) => setTimeout(r, 600));
    if (data.role === 'admin') {
      if (!data.inviteCode || data.inviteCode.trim().toUpperCase() !== ADMIN_INVITE_CODE) {
        throw new Error('Mã mời admin không hợp lệ');
      }
    }
    const users = getStoredUsers();
    if (users.find((u) => u.email === data.email)) throw new Error('Email này đã được sử dụng');
    const newUser: StoredUser = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      status: data.role === 'admin' ? 'pending' : 'active',
      ...(data.role === 'admin' && { adminRole: data.adminRole || 'analyst' }),
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveStoredUsers([...users, newUser]);
  },

  logout: () => {
    set({ user: null });
    localStorage.removeItem('user');
  },

  addUser: (data) => {
    const users = getStoredUsers();
    if (users.find((u) => u.email === data.email)) {
      throw new Error('Email này đã được sử dụng');
    }

    const newUser: StoredUser = {
      ...data,
      id: Date.now().toString(),
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    };
    saveStoredUsers([...users, newUser]);
    return newUser;
  },

  approveAdmin: (id) => {
    const users = getStoredUsers();
    saveStoredUsers(users.map((u) => (u.id === id ? { ...u, status: 'active' as UserStatus } : u)));
  },

  rejectAdmin: (id) => {
    const users = getStoredUsers();
    saveStoredUsers(users.map((u) => (u.id === id ? { ...u, status: 'rejected' as UserStatus } : u)));
  },

  updateUser: (id, updates) => {
    const users = getStoredUsers();
    const nextUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    saveStoredUsers(nextUsers);

    const currentRaw = localStorage.getItem('user');
    if (currentRaw) {
      const current = JSON.parse(currentRaw) as User;
      if (current.id === id) {
        const updated = nextUsers.find((u) => u.id === id);
        if (updated) {
          const { password: _, ...rest } = updated;
          set({ user: rest as User });
          localStorage.setItem('user', JSON.stringify(rest));
        }
      }
    }
  },

  getPendingAdmins: () => getStoredUsers().filter((u) => u.role === 'admin' && u.status === 'pending'),
  getAllUsers: () => getStoredUsers(),
}));
