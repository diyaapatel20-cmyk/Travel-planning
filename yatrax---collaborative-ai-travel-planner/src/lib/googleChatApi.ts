export interface ChatSpace {
  name: string; // e.g. "spaces/AAAA..."
  displayName?: string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  spaceThreadingState?: string;
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
}

export interface ChatMessage {
  name: string;
  text?: string;
  createTime: string;
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
}

const CHAT_BASE_URL = 'https://chat.googleapis.com/v1';

export class GoogleChatService {
  static async listSpaces(accessToken: string): Promise<ChatSpace[]> {
    const res = await fetch(`${CHAT_BASE_URL}/spaces`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Failed to fetch Google Chat spaces (${res.status})`
      );
    }

    const data = await res.json();
    return data.spaces || [];
  }

  static async createSpace(
    accessToken: string,
    displayName: string,
    description?: string
  ): Promise<ChatSpace> {
    const res = await fetch(`${CHAT_BASE_URL}/spaces`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayName,
        spaceType: 'SPACE',
        spaceDetails: {
          description: description || 'WayTogether collaborative trip planning space'
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Failed to create Google Chat space (${res.status})`
      );
    }

    return await res.json();
  }

  static async listMessages(accessToken: string, spaceName: string): Promise<ChatMessage[]> {
    const res = await fetch(`${CHAT_BASE_URL}/${spaceName}/messages?pageSize=30`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Failed to fetch space messages (${res.status})`
      );
    }

    const data = await res.json();
    // Return messages in chronological order (API usually returns most recent or descending)
    const messages: ChatMessage[] = data.messages || [];
    return messages.reverse();
  }

  static async sendMessage(
    accessToken: string,
    spaceName: string,
    text: string
  ): Promise<ChatMessage> {
    const res = await fetch(`${CHAT_BASE_URL}/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Failed to send message to Google Chat (${res.status})`
      );
    }

    return await res.json();
  }
}
