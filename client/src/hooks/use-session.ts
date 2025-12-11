import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserWithStats } from '@shared/schema';

const SESSION_KEY = 'runna_user_id';

export function useSession() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SESSION_KEY);
    }
    return null;
  });

  const { data: user, isLoading, error } = useQuery<UserWithStats | null>({
    queryKey: ['/api/current-user', userId],
    enabled: !!userId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error) {
      localStorage.removeItem(SESSION_KEY);
      setUserId(null);
    }
  }, [error]);

  const login = useCallback((newUserId: string) => {
    localStorage.setItem(SESSION_KEY, newUserId);
    setUserId(newUserId);
    queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUserId(null);
    queryClient.clear();
  }, [queryClient]);

  return {
    user: userId ? user : null,
    userId,
    isLoading: !!userId && isLoading,
    isLoggedIn: !!userId && !!user,
    login,
    logout,
  };
}
