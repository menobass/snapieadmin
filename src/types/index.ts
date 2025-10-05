export interface User {
  id: string;
  username: string;
  reason?: string;
  createdAt?: string;
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  timestamp: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  }>;
}
