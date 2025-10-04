'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/auth';
import { Trash2, UserPlus, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ username: '', email: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadUsers();
  }, [router, isAuthenticated]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading blacklisted users...');
      const data = await apiService.getBlacklistedUsers();
      console.log('Blacklisted users loaded:', data);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load blacklisted users:', error);
      const errorMessage = error instanceof Error 
        ? `Failed to load blacklisted users: ${error.message}`
        : 'Failed to load blacklisted users. Please check your connection and authentication.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim()) return;

    try {
      setIsAddingUser(true);
      const addedUser = await apiService.addUserToBlacklist(newUser);
      setUsers([...users, addedUser]);
      setNewUser({ username: '', email: '' });
    } catch {
      setError('Failed to add user to blacklist');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the blacklist?')) {
      return;
    }

    try {
      await apiService.removeUserFromBlacklist(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch {
      setError('Failed to remove user from blacklist');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Snapie Admin Portal</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Blacklisted Users</h2>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Debug Info Panel */}
            <div className="mb-4 rounded-md bg-blue-50 p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h4>
              <p className="text-xs text-blue-700">
                API Base URL: {process.env.NEXT_PUBLIC_BASE_API_URL || 'https://menosoft.xyz/api'}
              </p>
              <p className="text-xs text-blue-700">
                Authentication Token: {apiService.getToken() ? 'Present' : 'Missing'}
              </p>
              <p className="text-xs text-blue-700">
                Endpoint: /blacklisted
              </p>
              <button
                onClick={loadUsers}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Test API Connection
              </button>
            </div>

            {/* Add User Form */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <UserPlus size={20} className="mr-2" />
                Add User to Blacklist
              </h3>
              <form onSubmit={handleAddUser} className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAddingUser ? 'Adding...' : 'Add User'}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium">Blacklisted Users ({users.length})</h3>
              </div>
              {users.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No blacklisted users found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        {user.email && (
                          <p className="text-sm text-gray-500">{user.email}</p>
                        )}
                        {user.createdAt && (
                          <p className="text-xs text-gray-400">
                            Added: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-2"
                        title="Remove from blacklist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}