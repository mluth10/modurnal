import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { useSupabase } from '../contexts/SupabaseContext';
import { JournalService } from '../services/journal';
import { SpotifyListeningData } from '../types/journal';
import { SpotifyService } from '../services/spotify';

type NewEntryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NewEntry'>;

interface NewEntryScreenProps {
  navigation: NewEntryScreenNavigationProp;
}

const NewEntryScreen: React.FC<NewEntryScreenProps> = ({ navigation }) => {
  const { supabase, spotifyTokens } = useSupabase();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyListeningData | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const [isRefreshingSpotify, setIsRefreshingSpotify] = useState(false);

  // Load Spotify data for today when component mounts
  useEffect(() => {
    if (spotifyTokens?.accessToken) {
      loadSpotifyData();
    }
  }, [spotifyTokens]);

  const loadSpotifyData = async () => {
    if (!spotifyTokens?.accessToken) return;

    setIsLoadingSpotify(true);
    try {
      // Create a Spotify service to fetch fresh data
      const spotifyService = new SpotifyService(spotifyTokens.accessToken);
      const today = new Date().toISOString().split('T')[0];

      // Fetch fresh Spotify data for today
      const freshSpotifyData = await spotifyService.getDailyListeningData(today);

      // Store the data in the database
      if (supabase) {
        const { data: spotifyDataResult, error: spotifyError } = await supabase
          .from('spotify_listening_data')
          .upsert({
            date: freshSpotifyData.date,
            total_tracks_played: freshSpotifyData.total_tracks_played,
            total_minutes_listened: freshSpotifyData.total_minutes_listened,
            top_artists: freshSpotifyData.top_artists,
            listening_history: freshSpotifyData.listening_history,
          }, {
            onConflict: 'user_id,date'
          })
          .select()
          .single();

        if (spotifyError) {
          console.warn('Failed to store Spotify data:', spotifyError);
        } else {
          // Use the stored data with proper ID
          setSpotifyData({
            ...freshSpotifyData,
            id: spotifyDataResult.id,
            user_id: spotifyDataResult.user_id,
            created_at: spotifyDataResult.created_at,
            updated_at: spotifyDataResult.updated_at,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load Spotify data:', error);
    } finally {
      setIsLoadingSpotify(false);
    }
  };

  const refreshSpotifyData = async () => {
    if (!spotifyTokens?.accessToken || isRefreshingSpotify) return;

    setIsRefreshingSpotify(true);
    try {
      await loadSpotifyData();
    } finally {
      setIsRefreshingSpotify(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text for your journal entry');
      return;
    }

    if (text.trim().length < 10) {
      Alert.alert('Error', 'Journal entry must be at least 10 characters long');
      return;
    }

    if (!supabase) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }

    setIsSubmitting(true);
    try {
      const journalService = new JournalService(supabase, spotifyTokens?.accessToken);
      await journalService.createEntry(text.trim());

      Alert.alert(
        'Success',
        'Journal entry created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setText('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating journal entry:', error);

      let errorMessage = 'Failed to create journal entry. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'OpenAI is currently busy. Please try again in a moment.';
        } else if (error.message.includes('empty')) {
          errorMessage = 'Please enter some text for your journal entry.';
        } else if (error.message.includes('at least 10 characters')) {
          errorMessage = 'Journal entry must be at least 10 characters long.';
        } else if (error.message.includes('OpenAI API')) {
          errorMessage = 'AI analysis service is temporarily unavailable. Please try again.';
        } else if (error.message.includes('Spotify')) {
          errorMessage = 'Spotify data will be included when available.';
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (text.trim()) {
      Alert.alert(
        'Discard Entry',
        'Are you sure you want to discard this entry?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderSpotifySection = () => {
    if (!spotifyTokens?.accessToken) {
      return (
        <View style={styles.spotifySection}>
          <View style={styles.spotifyHeader}>
            <Ionicons name="musical-notes-outline" size={20} color="#1DB954" />
            <Text style={styles.spotifyTitle}>Spotify Data</Text>
          </View>
          <Text style={styles.spotifyUnavailable}>
            Connect your Spotify account to see your listening data
          </Text>
        </View>
      );
    }

    if (isLoadingSpotify) {
      return (
        <View style={styles.spotifySection}>
          <View style={styles.spotifyHeader}>
            <Ionicons name="musical-notes-outline" size={20} color="#1DB954" />
            <Text style={styles.spotifyTitle}>Today's Listening</Text>
            <TouchableOpacity onPress={refreshSpotifyData} style={styles.refreshButton} disabled={isRefreshingSpotify}>
              {isRefreshingSpotify ? (
                <ActivityIndicator size="small" color="#1DB954" />
              ) : (
                <Ionicons name="refresh" size={16} color="#1DB954" />
              )}
            </TouchableOpacity>
          </View>
          <ActivityIndicator size="small" color="#1DB954" />
        </View>
      );
    }

    if (!spotifyData || spotifyData.total_tracks_played === 0) {
      return (
        <View style={styles.spotifySection}>
          <View style={styles.spotifyHeader}>
            <Ionicons name="musical-notes-outline" size={20} color="#1DB954" />
            <Text style={styles.spotifyTitle}>Today's Listening</Text>
            <TouchableOpacity onPress={refreshSpotifyData} style={styles.refreshButton} disabled={isRefreshingSpotify}>
              {isRefreshingSpotify ? (
                <ActivityIndicator size="small" color="#1DB954" />
              ) : (
                <Ionicons name="refresh" size={16} color="#1DB954" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.spotifyUnavailable}>
            No listening data available for today
          </Text>
          <TouchableOpacity onPress={loadSpotifyData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.spotifySection}>
        <View style={styles.spotifyHeader}>
          <Ionicons name="musical-notes-outline" size={20} color="#1DB954" />
          <Text style={styles.spotifyTitle}>Today's Listening</Text>
          <TouchableOpacity onPress={refreshSpotifyData} style={styles.refreshButton} disabled={isRefreshingSpotify}>
            {isRefreshingSpotify ? (
              <ActivityIndicator size="small" color="#1DB954" />
            ) : (
              <Ionicons name="refresh" size={16} color="#1DB954" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.spotifyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{spotifyData.total_tracks_played}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(spotifyData.total_minutes_listened)}</Text>
            <Text style={styles.statLabel}>Listened</Text>
          </View>
        </View>

        <View style={styles.topArtistsSection}>
          <Text style={styles.topArtistsTitle}>Top Artists</Text>
          {spotifyData.top_artists && spotifyData.top_artists.length > 0 ? (
            spotifyData.top_artists.map((artist, idx) => (
              <View key={artist.artist + idx} style={styles.topArtistItem}>
                <Text style={styles.topArtistName}>{artist.artist}</Text>
                <Text style={styles.topArtistCount}>{artist.count} play{artist.count !== 1 ? 's' : ''}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTopArtistsText}>No top artists found for today.</Text>
          )}
        </View>

        <Text style={styles.lastUpdated}>
          Last updated: {new Date(spotifyData.updated_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Entry</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              style={[
                styles.submitButton,
                (!text.trim() || isSubmitting) && styles.submitButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {renderSpotifySection()}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>What's on your mind?</Text>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="Write your thoughts, feelings, or experiences here..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              autoFocus
              maxLength={5000}
            />
            <Text style={styles.characterCount}>
              {text.length}/5000 characters
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="sparkles-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Your entry will be automatically analyzed for sentiment and summarized
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="musical-notes-outline" size={20} color="#1DB954" />
              <Text style={styles.infoText}>
                Your Spotify listening data will be included with this entry
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Your data is securely stored and encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  spotifySection: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotifyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  spotifyUnavailable: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  spotifyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  topTracksSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1DB954',
    width: 20,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 8,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  trackArtist: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  infoContainer: {
    padding: 20,
    paddingTop: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  refreshButton: {
    padding: 5,
    marginLeft: 10,
  },
  retryButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1DB954',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // --- Added styles for Top Artists section ---
  topArtistsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 12,
  },
  topArtistsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  topArtistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topArtistName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  topArtistCount: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  noTopArtistsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NewEntryScreen; 