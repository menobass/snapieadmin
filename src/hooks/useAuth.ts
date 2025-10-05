'use client';

import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

export interface UseAuthReturn {
  login: (username: string, password: string) => Promise<boolean>;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting admin login for:', username);
      
      const authResponse = await apiService.adminLogin(username, password);
      
      console.log('Login successful:', authResponse.message || 'Authentication complete');
      console.log('JWT token received and stored');
      
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setError(null);
  }, []);

  return {
    login,
    token: apiService.getToken(),
    isAuthenticated: apiService.isAuthenticated(),
    isLoading,
    error,
    logout,
  };
}