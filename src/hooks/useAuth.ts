'use client';

import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { HiveAuthService } from '@/lib/hiveAuth';

export interface UseAuthReturn {
  authenticate: (username: string, postingKey?: string) => Promise<boolean>;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async (username: string, postingKey?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Request challenge
      console.log('Step 1: Requesting challenge for username:', username);
      const challengeResponse = await apiService.requestChallenge(username);
      
      // Step 2: Sign the challenge
      console.log('Step 2: Signing challenge...');
      const message = HiveAuthService.formatChallengeMessage(
        username, 
        challengeResponse.challenge, 
        challengeResponse.timestamp
      );

      let signature: string;
      
      if (postingKey) {
        // Use manual posting key (preferred for localhost/development)
        console.log('Using manual posting key for signing...');
        signature = HiveAuthService.signWithPostingKey(message, postingKey);
      } else if (HiveAuthService.isKeychainAvailable()) {
        // Use Hive Keychain for signing (handshake + sign in one step)
        console.log('Using Hive Keychain for signing...');
        signature = await HiveAuthService.signWithKeychain(username, message);
      } else {
        throw new Error('No signing method available. Please install Hive Keychain or provide a posting key.');
      }

      // Step 3: Verify signature and get JWT
      console.log('Step 3: Verifying signature and getting JWT...');
      const authResponse = await apiService.verifyChallenge({
        username,
        challenge: challengeResponse.challenge,
        timestamp: challengeResponse.timestamp,
        signature
      });

      console.log('Authentication successful:', authResponse.message);
      console.log('JWT token received and stored');
      console.log('Returning true to trigger navigation...');
      return true;

    } catch (err) {
      console.error('Authentication failed:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Authentication failed. Please try again.';
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
    authenticate,
    token: apiService.getToken(),
    isAuthenticated: apiService.isAuthenticated(),
    isLoading,
    error,
    logout,
  };
}