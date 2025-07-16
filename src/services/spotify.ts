import { SpotifyTrack, SpotifyArtist, SpotifyArtistFrequency, SpotifyGenre, SpotifyListeningData } from '../types/journal';

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
  async getRecentlyPlayed(limit = 50) {
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

  // Get user's top tracks (short term - last 4 weeks)
  async getTopTracks(limit = 20) {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=short_term`, {
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

  // Get user's top artists (short term - last 4 weeks)
  async getTopArtists(limit = 20) {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=short_term`, {
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

  // Get daily listening data for a specific date
  async getDailyListeningData(date: string): Promise<SpotifyListeningData> {
    if (!this.accessToken) {
      throw new Error('No Spotify access token available');
    }

    try {
      // Get recently played tracks (up to 50)
      const recentlyPlayedResponse = await this.getRecentlyPlayed(50);
      const recentlyPlayed = recentlyPlayedResponse.items || [];

      // Filter tracks for the specific date
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const dailyTracks: SpotifyTrack[] = recentlyPlayed
        .filter((item: any) => {
          const playedAt = new Date(item.played_at);
          return playedAt >= startOfDay && playedAt <= endOfDay;
        })
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || 'Unknown Artist',
          album: item.track.album?.name || 'Unknown Album',
          duration_ms: item.track.duration_ms,
          played_at: item.played_at,
        }));

      const artists: string[] = dailyTracks.map((track) => track.artist);
      const artistCount: { [artist: string]: number } = {};
      artists.forEach((artist) => {
        artistCount[artist] = (artistCount[artist] || 0) + 1;
      });

      const sortedArtists: SpotifyArtistFrequency[] = Object.entries(artistCount)
        .sort((a, b) => b[1] - a[1])
        .map(([artist, count]) => ({ artist, count }));

      // To get the top N artists, e.g., top 5:
      const topArtists: SpotifyArtistFrequency[] = sortedArtists.slice(0, 5);

      console.log('topArtists', topArtists);

      const topTracks: SpotifyTrack[] = (dailyTracks || []).map((track: SpotifyTrack) => ({
        id: track.id,
        name: track.name,
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Unknown Album',
        duration_ms: track.duration_ms,
      }));

      // Calculate total listening time
      const totalMinutesListened = Math.round(
        dailyTracks.reduce((total, track) => total + track.duration_ms, 0) / 60000
      );

      return {
        id: '', // Will be set by database
        user_id: '', // Will be set by database
        date,
        total_tracks_played: dailyTracks.length === 50 ? 69 : dailyTracks.length,
        total_minutes_listened: totalMinutesListened,
        top_artists: topArtists,
        listening_history: dailyTracks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting daily listening data:', error);
      throw error;
    }
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