'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { User } from '@/types';
import DiscordReports from './DiscordReports';

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [deleteUsername, setDeleteUsername] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const loadList = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiService.getBlacklistedUsers();
      setUsers(data);
      setCurrentPage(1); // Reset to first page when loading new data
      setMessage({ type: 'success', text: `Loaded ${data.length} blacklisted users` });
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage({ type: 'error', text: 'Failed to load blacklisted users' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      await apiService.addUserToBlacklist({ username: addUsername });
      setMessage({ type: 'success', text: `Added ${addUsername} to blacklist` });
      setAddUsername('');
      // Reload list
      await loadList();
    } catch (error) {
      console.error('Failed to add user:', error);
      setMessage({ type: 'error', text: `Failed to add ${addUsername}` });
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklistFromDiscord = async (username: string) => {
    setAddUsername(username);
    setLoading(true);
    setMessage(null);
    try {
      await apiService.addUserToBlacklist({ username });
      setMessage({ type: 'success', text: `Added ${username} to blacklist from Discord report` });
      setAddUsername('');
      await loadList();
    } catch (error) {
      console.error('Failed to add user:', error);
      setMessage({ type: 'error', text: `Failed to add ${username}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteUsername.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      // Use username directly as the ID for deletion
      await apiService.removeUserFromBlacklist(deleteUsername);
      setMessage({ type: 'success', text: `Removed ${deleteUsername} from blacklist` });
      setDeleteUsername('');
      // Reload list
      await loadList();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setMessage({ type: 'error', text: `Failed to remove ${deleteUsername}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Snapie Administration</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Load List Button */}
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={loadList}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load List'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* User List */}
        {users.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Blacklisted Users ({filteredUsers.length})</h2>
                <input
                  type="text"
                  placeholder="Search usernames..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.reason || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No users match your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add User Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add User</h2>
          <form onSubmit={handleAddUser} className="flex gap-3">
            <input
              type="text"
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value)}
              placeholder="Enter username to add"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !addUsername.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Delete User Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Delete User</h2>
          <form onSubmit={handleDeleteUser} className="flex gap-3">
            <input
              type="text"
              value={deleteUsername}
              onChange={(e) => setDeleteUsername(e.target.value)}
              placeholder="Enter username to delete"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !deleteUsername.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Discord Reports */}
        <DiscordReports onBlacklistUser={handleBlacklistFromDiscord} />
      </div>
    </div>
  );
}
