import { Client, PrivateKey } from '@hiveio/dhive';

// Initialize Hive client
const client = new Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network'
]);

export class HiveService {
  private postingKey: string | null = null;

  constructor() {
    this.postingKey = process.env.SNAPIE_POSTING_KEY || null;
  }

  /**
   * Downvote a post on Hive blockchain
   * @param author - The author of the post
   * @param permlink - The permlink of the post
   * @param weight - Voting weight (-10000 to 10000, negative for downvote)
   */
  async downvotePost(author: string, permlink: string, weight: number = -10000): Promise<void> {
    if (!this.postingKey) {
      throw new Error('Snapie posting key not configured');
    }

    if (weight > 0) {
      throw new Error('Weight must be negative for downvotes');
    }

    try {
      const privateKey = PrivateKey.fromString(this.postingKey);
      
      const voteOperation: ['vote', {
        voter: string;
        author: string;
        permlink: string;
        weight: number;
      }] = [
        'vote',
        {
          voter: 'snapie',
          author: author,
          permlink: permlink,
          weight: weight
        }
      ];

      const result = await client.broadcast.sendOperations([voteOperation], privateKey);
      
      console.log(`Downvoted @${author}/${permlink} with weight ${weight}`, result);
    } catch (error) {
      console.error('Failed to downvote post:', error);
      throw new Error(`Failed to downvote post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Hive post URL to extract author and permlink
   * @param url - Hive post URL (e.g., https://peakd.com/@author/permlink)
   */
  parseHiveUrl(url: string): { author: string; permlink: string } | null {
    try {
      // Handle various Hive frontend URLs
      const patterns = [
        // PeakD: https://peakd.com/@author/permlink
        /peakd\.com\/@([^\/]+)\/(.+)$/,
        // Hive.blog: https://hive.blog/@author/permlink
        /hive\.blog\/@([^\/]+)\/(.+)$/,
        // Ecency: https://ecency.com/@author/permlink
        /ecency\.com\/@([^\/]+)\/(.+)$/,
        // Direct format: @author/permlink
        /@([^\/]+)\/(.+)$/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            author: match[1],
            permlink: match[2]
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to parse Hive URL:', error);
      return null;
    }
  }

  /**
   * Check if @snapie account exists and is valid
   */
  async validateSnapieAccount(): Promise<boolean> {
    try {
      const account = await client.database.getAccounts(['snapie']);
      return account && account.length > 0;
    } catch (error) {
      console.error('Failed to validate snapie account:', error);
      return false;
    }
  }
}

export const hiveService = new HiveService();