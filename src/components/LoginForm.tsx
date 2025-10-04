'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { HiveAuthService } from '@/lib/hiveAuth';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [postingKey, setPostingKey] = useState('');
  const [useKeychain, setUseKeychain] = useState(HiveAuthService.isKeychainAvailable());
  const router = useRouter();
  
  const { authenticate, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }

    const success = await authenticate(
      username, 
      useKeychain ? undefined : postingKey
    );

    if (success) {
      router.push('/dashboard');
    }
  };

  const handleKeychainToggle = () => {
    if (HiveAuthService.isKeychainAvailable()) {
      setUseKeychain(!useKeychain);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Snapie Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage blacklisted users
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Hive Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your Hive username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Keychain Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="use-keychain"
                  name="use-keychain"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={useKeychain}
                  onChange={handleKeychainToggle}
                  disabled={!HiveAuthService.isKeychainAvailable()}
                />
                <label htmlFor="use-keychain" className="ml-2 block text-sm text-gray-900">
                  Use Hive Keychain
                </label>
              </div>
              {!HiveAuthService.isKeychainAvailable() && (
                <span className="text-xs text-red-600">Keychain not detected</span>
              )}
            </div>

            {/* Manual Posting Key (only show if not using Keychain) */}
            {!useKeychain && (
              <div>
                <label htmlFor="postingKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Posting Key
                </label>
                <input
                  id="postingKey"
                  name="postingKey"
                  type="password"
                  required={!useKeychain}
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your Hive posting key"
                  value={postingKey}
                  onChange={(e) => setPostingKey(e.target.value)}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your posting key is used for signing and never stored.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-md bg-blue-50 p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• We&apos;ll request a challenge from the server</li>
              <li>• You&apos;ll sign it with your Hive credentials</li>
              <li>• We&apos;ll verify your signature and log you in</li>
              {useKeychain ? (
                <li>• ✅ Using Hive Keychain for secure signing</li>
              ) : (
                <li>• ⚠️ Manual posting key (install Keychain for better security)</li>
              )}
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !username.trim() || (!useKeychain && !postingKey.trim())}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Sign in with Hive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}