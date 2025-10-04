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
   * Connect and sign with Hive Keychain in one step (corrected implementation)
   */
  static async signWithKeychain(username: string, message: string): Promise<string> {
    if (typeof window === 'undefined' || !window.hive_keychain) {
      throw new Error('Hive Keychain not available');
    }

    return new Promise((resolve, reject) => {
      console.log('Step 1: Requesting handshake with Keychain...');
      
      window.hive_keychain!.requestHandshake(() => {
        console.log('Handshake complete (no payload expected). Proceeding to sign...');

        // Step 2: Sign challenge string
        window.hive_keychain!.requestSignBuffer(
          username,
          message,
          'Posting',
          (signResponse: KeychainResponse) => {
            console.log('Sign response:', signResponse);

            if (!signResponse || !signResponse.success || !signResponse.result) {
              return reject(new Error(signResponse?.error || 'Failed to sign challenge'));
            }

            resolve(signResponse.result);
          }
        );
      });
    });
  }

  

  /**
   * Sign a message using a posting key directly (fallback method)
   */
  static signWithPostingKey(message: string, postingKey: string): string {
    try {
      console.log('Signing message:', message);
      console.log('Posting key length:', postingKey.length);
      console.log('Posting key starts with:', postingKey.substring(0, 5));
      
      const privateKey = PrivateKey.fromString(postingKey);
      console.log('Private key parsed successfully');
      
      const messageBuffer = Buffer.from(message, 'utf8');
      console.log('Message buffer created, length:', messageBuffer.length);
      
      const signature = privateKey.sign(messageBuffer);
      console.log('Signature created successfully');
      
      return signature.toString();
    } catch (error) {
      console.error('Signing error details:', error);
      throw new Error(`Invalid posting key or signing failed: ${error instanceof Error ? error.message : String(error)}`);
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