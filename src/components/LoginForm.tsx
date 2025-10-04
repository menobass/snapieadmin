'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { HiveAuthService } from '@/lib/hiveAuth';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [postingKey, setPostingKey] = useState('');
  const [useKeychain, setUseKeychain] = useState(false);
  const router = useRouter();
  
  const { authenticate, isLoading, error } = useAuth();

  // Check keychain availability after component mounts
  useEffect(() => {
    const checkKeychain = () => {
      const isAvailable = HiveAuthService.isKeychainAvailable();
      console.log('Keychain available:', isAvailable);
      if (typeof window !== 'undefined' && window.hive_keychain) {
        console.log('Keychain object keys:', Object.keys(window.hive_keychain));
      }
      setUseKeychain(isAvailable);
    };
    
    // Check immediately and after a short delay (in case Keychain loads async)
    checkKeychain();
    const timer = setTimeout(checkKeychain, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

            {/* Authentication Method Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Authentication Method
              </label>
              
              {/* Keychain Option */}
              <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50">
                <input
                  id="use-keychain"
                  name="auth-method"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={useKeychain}
                  onChange={() => setUseKeychain(true)}
                  disabled={!HiveAuthService.isKeychainAvailable()}
                />
                <div className="flex-1">
                  <label htmlFor="use-keychain" className="block text-sm font-medium text-gray-900">
                    🔐 Hive Keychain (Recommended)
                  </label>
                  <p className="text-xs text-gray-600">
                    Secure browser extension - no need to enter private keys
                  </p>
                  {!HiveAuthService.isKeychainAvailable() && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Keychain not detected. <a 
                        href="https://hive-keychain.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-red-700"
                      >
                        Install extension
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Manual Posting Key Option */}
              <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50">
                <input
                  id="use-posting-key"
                  name="auth-method"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={!useKeychain}
                  onChange={() => setUseKeychain(false)}
                />
                <div className="flex-1">
                  <label htmlFor="use-posting-key" className="block text-sm font-medium text-gray-900">
                    🔑 Manual Posting Key
                  </label>
                  <p className="text-xs text-gray-600">
                    Enter your Hive posting key directly (less secure)
                  </p>
                  {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                    <p className="text-xs text-orange-600 mt-1">
                      ℹ️ Recommended for localhost development
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Manual Posting Key (only show if not using Keychain) */}
            {!useKeychain && (
              <div className="space-y-2">
                <label htmlFor="postingKey" className="block text-sm font-medium text-gray-700">
                  Hive Posting Key
                </label>
                <input
                  id="postingKey"
                  name="postingKey"
                  type="password"
                  required={!useKeychain}
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="5JxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxP"
                  value={postingKey}
                  onChange={(e) => setPostingKey(e.target.value)}
                  disabled={isLoading}
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Security Notice
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Your posting key is used only for signing and is never stored</li>
                          <li>Make sure you&apos;re on the correct website</li>
                          <li>Consider using Hive Keychain for better security</li>
                          <li>Never share your posting key with anyone</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
            <h4 className="text-sm font-medium text-blue-800 mb-2">Authentication Process:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Server sends a unique challenge for your username</li>
              <li>• You sign the challenge with your Hive credentials</li>
              <li>• Server verifies your signature and issues a JWT token</li>
              <li>• Token is used for all subsequent API requests</li>
            </ul>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600 font-medium">
                {useKeychain ? (
                  "🔐 Keychain Mode: Secure signing through browser extension"
                ) : (
                  "🔑 Manual Mode: Direct posting key entry"
                )}
              </p>
              {!useKeychain && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Perfect for localhost development or when Keychain isn&apos;t available
                </p>
              )}
            </div>
          </div>

          {/* Debug Panel */}
          <div className="rounded-md bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Debug Info:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Username: {username || 'Empty'}</div>
              <div>Auth Method: {useKeychain ? 'Keychain' : 'Posting Key'}</div>
              <div>Posting Key: {postingKey ? `${postingKey.substring(0, 10)}...` : 'Empty'}</div>
              <div>Keychain Available: {HiveAuthService.isKeychainAvailable() ? '✅ Yes' : '❌ No'}</div>
              <div>Keychain Methods: {HiveAuthService.getKeychainMethods().join(', ') || 'None detected'}</div>
              <div>Button Enabled: {(!isLoading && username.trim() && (useKeychain || postingKey.trim())) ? '✅ Yes' : '❌ No'}</div>
              <button
                type="button"
                onClick={() => {
                  const test = HiveAuthService.testKeychain();
                  console.log('Keychain Test Result:', test);
                  alert(`Keychain Test:\nAvailable: ${test.available}\nMethods: ${test.methods.join(', ')}\nError: ${test.error || 'None'}`);
                }}
                className="mt-2 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
              >
                Test Keychain
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !username.trim() || (!useKeychain && !postingKey.trim())}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Sign in with Hive'}
            </button>
            
            {/* Button status indicator */}
            <div className="mt-2 text-center text-xs text-gray-500">
              {!username.trim() && (
                <p>Enter your Hive username to continue</p>
              )}
              {username.trim() && !useKeychain && !postingKey.trim() && (
                <p>Enter your posting key to sign in</p>
              )}
              {username.trim() && useKeychain && !HiveAuthService.isKeychainAvailable() && (
                <p>Keychain not available - switch to posting key method</p>
              )}
              {username.trim() && ((useKeychain && HiveAuthService.isKeychainAvailable()) || (!useKeychain && postingKey.trim())) && (
                <p>✅ Ready to authenticate</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}