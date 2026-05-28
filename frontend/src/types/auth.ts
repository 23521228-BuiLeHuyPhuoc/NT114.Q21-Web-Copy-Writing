import type { AdminRole } from '@/lib/permissions';

export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'locked';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole;
  status: UserStatus;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  password?: string;
}
