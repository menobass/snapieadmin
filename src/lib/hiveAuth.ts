import { PrivateKey } from '@hiveio/dhive';

// Hive Keychain interface for TypeScript
interface KeychainResponse {
  success: boolean;
  message?: string;
  result?: string;
}

declare global {
  interface Window {
    hive_keychain?: {
      requestSignBuffer: (
        username: string,
        message: string,
        method: string,
        callback: (response: KeychainResponse) => void
      ) => void;
      isInstalled: () => boolean;
    };
  }
}

export class HiveAuthService {
  /**
   * Sign a message using Hive Keychain (browser extension)
   */
  static async signWithKeychain(username: string, message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.hive_keychain) {
        reject(new Error('Hive Keychain not installed. Please install the browser extension.'));
        return;
      }

      window.hive_keychain.requestSignBuffer(
        username,
        message,
        'Posting',
        (response: KeychainResponse) => {
          if (response.success && response.result) {
            resolve(response.result);
          } else {
            reject(new Error(response.message || 'Keychain signing failed'));
          }
        }
      );
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
   * Check if Hive Keychain is available
   */
  static isKeychainAvailable(): boolean {
    return typeof window !== 'undefined' && 
           !!window.hive_keychain && 
           window.hive_keychain.isInstalled();
  }

  /**
   * Format the challenge message for signing
   */
  static formatChallengeMessage(username: string, challenge: string, timestamp: number): string {
    return `${username}:${challenge}:${timestamp}`;
  }
}