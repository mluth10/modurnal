export class SpotifyService {
  private accessToken: string | null;

  constructor(accessToken: string | null) {
    this.accessToken = accessToken;
  }

  // Get user's Spotify profile
  async getUserProfile() {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  }

  // Get user's playlists
  async getUserPlaylists(limit = 20) {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  }

  // Get user's recently played tracks
  async getRecentlyPlayed(limit = 20) {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  }

  // Search for tracks
  async searchTracks(query: string, limit = 10) {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  }
} 