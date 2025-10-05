import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface AuthResponse {
  token: string;
  message?: string;
}

interface User {
  id: string;
  username: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthenticatedRequestOptions {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  shouldCache?: boolean;
  timeoutMs?: number;
  retries?: number;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private baseUrl: string = '/api'; // Use local proxy routes in development to avoid CORS

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle 401 responses by clearing token
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Redirect to login if needed
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Generic authenticated request method similar to your makeAuthenticatedRequest
  async makeAuthenticatedRequest<T = unknown>(options: AuthenticatedRequestOptions): Promise<T> {
    const { path, method, data, timeoutMs = 10000, retries = 2 } = options;
    
    const requestConfig = {
      url: path,
      method,
      data,
      timeout: timeoutMs,
    };

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse<T> = await this.api.request(requestConfig);
        return response.data;
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }

  // Simple admin login
  async adminLogin(username: string, password: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/admin-login', {
        username,
        password
      });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  // Temporary method for testing - allows manual token setting
  setTestToken(token: string): void {
    console.log('Setting test token for API testing');
    this.setToken(token);
  }

  // Test connection to the API without authentication
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Try a simple request to see if the API is reachable
      await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
      return { success: true, message: 'API is reachable' };
    } catch (error) {
      console.error('API connection test failed:', error);
      if (axios.isAxiosError(error)) {
        return { 
          success: false, 
          message: `Connection failed: ${error.code || error.message}` 
        };
      }
      return { success: false, message: 'Unknown connection error' };
    }
  }

  logout(): void {
    this.clearToken();
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // Blacklisted users methods
  async getBlacklistedUsers(): Promise<User[]> {
    const response = await this.makeAuthenticatedRequest<{ blacklistedUsers: string[] }>({
      path: '/blacklisted',
      method: 'GET',
      shouldCache: true,
      timeoutMs: 10000,
      retries: 2
    });
    // Convert array of usernames to User objects
    return response.blacklistedUsers.map((username) => ({
      id: username, // Use username as ID since backend doesn't provide IDs
      username: username,
      reason: undefined,
      createdAt: undefined
    }));
  }

  async addUserToBlacklist(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.api.post('/blacklisted', { username: user.username });
  }

  async removeUserFromBlacklist(userId: string): Promise<void> {
    await this.api.delete(`/blacklist/${userId}`);
  }
}

export const apiService = new ApiService();