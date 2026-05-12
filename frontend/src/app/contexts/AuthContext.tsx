/**
 * Backward-compatible shim. Real state lives in `@/stores/authStore`.
 * Prefer `useSession()` / `signIn()` / `signOut()` from `@/lib/auth` in new code.
 */
import { useEffect, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';

export {
  ADMIN_INVITE_CODE,
  type User,
  type UserRole,
  type UserStatus,
  type RegisterData,
  type StoredUser,
} from '@/types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isLoading: s.isLoading,
      login: s.login,
      register: s.register,
      logout: s.logout,
      addUser: s.addUser,
      approveAdmin: s.approveAdmin,
      rejectAdmin: s.rejectAdmin,
      updateUser: s.updateUser,
      getPendingAdmins: s.getPendingAdmins,
      getAllUsers: s.getAllUsers,
    })),
  );
}
