'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { DiscordMessage } from '@/types';

interface DiscordReportsProps {
  onBlacklistUser: (username: string) => void;
}

export default function DiscordReports({ onBlacklistUser }: DiscordReportsProps) {
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDiscordMessages();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load Discord messages:', err);
      setError('Failed to load reports from Discord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadMessages, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const extractUsername = (message: DiscordMessage): string | null => {
    // Try to extract username from message content or embeds
    const content = message.content.toLowerCase();
    
    // Look for @username pattern
    const mentionMatch = content.match(/@(\w+)/);
    if (mentionMatch) return mentionMatch[1];

    // Look for "user: username" or "username:" pattern
    const userMatch = content.match(/(?:user[:\s]+|username[:\s]+)(\w+)/i);
    if (userMatch) return userMatch[1];

    // Check embeds for username field
    if (message.embeds && message.embeds.length > 0) {
      for (const embed of message.embeds) {
        if (embed.fields) {
          const usernameField = embed.fields.find(f => 
            f.name.toLowerCase().includes('user') || 
            f.name.toLowerCase().includes('username')
          );
          if (usernameField) return usernameField.value;
        }
      }
    }

    return null;
  };

  const handleBlacklist = (message: DiscordMessage) => {
    const username = extractUsername(message);
    if (username) {
      onBlacklistUser(username);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Discord Reports</h2>
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={loadMessages}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 text-red-800">
          {error}
        </div>
      )}

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {messages.length === 0 && !loading && (
          <div className="px-6 py-8 text-center text-gray-500">
            No reports found
          </div>
        )}

        {messages.map((message) => {
          const username = extractUsername(message);
          
          return (
            <div key={message.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-900">
                      {message.author.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {message.content && (
                    <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}

                  {message.embeds && message.embeds.map((embed, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                      {embed.title && (
                        <h4 className="font-medium text-sm mb-1">{embed.title}</h4>
                      )}
                      {embed.description && (
                        <p className="text-sm text-gray-600 mb-2">{embed.description}</p>
                      )}
                      {embed.fields && (
                        <div className="space-y-1">
                          {embed.fields.map((field, fieldIdx) => (
                            <div key={fieldIdx} className="text-sm">
                              <span className="font-medium">{field.name}:</span>{' '}
                              <span className="text-gray-600">{field.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {username && (
                    <div className="text-xs text-blue-600 mt-2">
                      Detected user: @{username}
                    </div>
                  )}
                </div>

                {username && (
                  <button
                    onClick={() => handleBlacklist(message)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap"
                  >
                    Blacklist
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
