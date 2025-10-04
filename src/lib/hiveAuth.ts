import { PrivateKey } from '@hiveio/dhive';

// Hive Keychain interface for TypeScript based on actual working implementation
interface KeychainResponse {
  success: boolean;
  message?: string;
  error?: string;
  result?: string;
  data?: {
    username?: string;
  };
}

interface KeychainCustomJsonResponse {
  success: boolean;
  message?: string;
  error?: string;
  result?: {
    id: string;
    block_num: number;
  };
}

// Keychain interface based on your working implementation
declare global {
  interface Window {
    hive_keychain?: {
      requestHandshake: (callback: (response: KeychainResponse) => void) => void;
      requestCustomJson: (
        username: string,
        id: string,
        key: string,
        json: string,
        display_name: string,
        callback: (response: KeychainCustomJsonResponse) => void
      ) => void;
      requestSignBuffer: (
        username: string,
        message: string,
        key: string,
        callback: (response: KeychainResponse) => void
      ) => void;
    };
  }
}

export class HiveAuthService {
  private static retryAttempts = 0;
  private static maxRetries = 3;

  /**
   * Check if Keychain is available with retry mechanism like your working code
   */
  static async checkKeychainAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkKeychain = () => {
        if (window.hive_keychain) {
          console.log('Keychain detected');
          resolve(true);
        } else {
          this.retryAttempts++;
          if (this.retryAttempts < this.maxRetries) {
            setTimeout(checkKeychain, 1000);
          } else {
            console.warn('Keychain not detected after retries');
            resolve(false);
          }
        }
      };
      checkKeychain();
    });
  }

  /**
   * Connect to Keychain using handshake (like your working code)
   */
  static async connectKeychain(): Promise<{ success: boolean; username?: string; error?: string }> {
    if (!window.hive_keychain) {
      return { success: false, error: 'Keychain not available. Please install Hive Keychain extension.' };
    }

    return new Promise((resolve) => {
      window.hive_keychain!.requestHandshake((response) => {
        if (response.success && response.data?.username) {
          console.log('Keychain connected:', response.data.username);
          resolve({ success: true, username: response.data.username });
        } else {
          console.error('Keychain connection failed:', response);
          resolve({ 
            success: false, 
            error: response.error || response.message || 'Failed to connect to Keychain' 
          });
        }
      });
    });
  }

  /**
   * Sign a message using Hive Keychain (browser extension)
   */
  static async signWithKeychain(username: string, message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.hive_keychain) {
        reject(new Error('Hive Keychain not installed. Please install the browser extension.'));
        return;
      }

      try {
        console.log('Signing message with Keychain:', { username, message });
        
        window.hive_keychain.requestSignBuffer(
          username,
          message,
          'Posting',
          (response: KeychainResponse) => {
            console.log('Keychain response:', response);
            if (response.success && response.result) {
              resolve(response.result);
            } else {
              reject(new Error(response.error || response.message || 'Keychain signing failed'));
            }
          }
        );
      } catch (error) {
        console.error('Keychain signing error:', error);
        reject(new Error('Keychain interaction failed: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }

  /**
   * Sign a message using a posting key directly (fallback method)
   */
  static signWithPostingKey(message: string, postingKey: string): string {
    try {
      const privateKey = PrivateKey.fromString(postingKey);
      const messageBuffer = Buffer.from(message, 'utf8');
      const signature = privateKey.sign(messageBuffer);
      return signature.toString();
    } catch {
      throw new Error('Invalid posting key or signing failed');
    }
  }

  /**
   * Check if Hive Keychain is available (synchronous check)
   */
  static isKeychainAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.hive_keychain !== undefined && window.hive_keychain !== null;
  }

  /**
   * Get available Keychain methods for debugging
   */
  static getKeychainMethods(): string[] {
    if (typeof window !== 'undefined' && window.hive_keychain) {
      return Object.keys(window.hive_keychain);
    }
    return [];
  }

  /**
   * Format the challenge message for signing
   */
  static formatChallengeMessage(username: string, challenge: string, timestamp: number): string {
    return `${username}:${challenge}:${timestamp}`;
  }

  /**
   * Test Keychain availability and methods (for debugging)
   */
  static testKeychain(): { available: boolean; methods: string[]; error?: string } {
    if (typeof window === 'undefined') {
      return { available: false, methods: [], error: 'Not in browser environment' };
    }

    if (!window.hive_keychain) {
      return { available: false, methods: [], error: 'Keychain not detected' };
    }

    try {
      const methods = Object.keys(window.hive_keychain);
      return { available: true, methods };
    } catch (error) {
      return { 
        available: false, 
        methods: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}