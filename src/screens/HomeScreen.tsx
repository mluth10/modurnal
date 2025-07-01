import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { useSupabase } from '../contexts/SupabaseContext';
import { JournalService } from '../services/journal';
import { SpotifyService } from '../services/spotify';
import { JournalEntry } from '../types/journal';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { supabase, loading, user, signOut, spotifyTokens } = useSupabase();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);
  const [loadingSpotify, setLoadingSpotify] = useState(false);

  useEffect(() => {
    if (supabase && !loading && user) {
      loadEntries();
      if (spotifyTokens?.accessToken) {
        loadSpotifyProfile();
      }
    }
  }, [supabase, loading, user, spotifyTokens]);

  const loadEntries = async () => {
    if (!supabase || !user) return;

    setLoadingEntries(true);
    try {
      const journalService = new JournalService(supabase);
      const fetchedEntries = await journalService.getEntries();
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoadingEntries(false);
    }
  };

  const loadSpotifyProfile = async () => {
    if (!spotifyTokens?.accessToken) return;

    setLoadingSpotify(true);
    try {
      const spotifyService = new SpotifyService(spotifyTokens.accessToken);
      const profile = await spotifyService.getUserProfile();
      setSpotifyProfile(profile);
    } catch (error) {
      console.error('Error loading Spotify profile:', error);
    } finally {
      setLoadingSpotify(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Spotify User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.created_at)}</Text>
        {item.sentiment && (
          <View
            style={[
              styles.sentimentBadge,
              { backgroundColor: getSentimentColor(item.sentiment) },
            ]}
          >
            <Text style={styles.sentimentText}>{item.sentiment}</Text>
          </View>
        )}
      </View>
      <Text style={styles.entryText} numberOfLines={3}>
        {item.text}
      </Text>
      {item.summary && (
        <Text style={styles.entrySummary} numberOfLines={2}>
          {item.summary}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={40} color="#1DB954" />
            <View style={styles.userText}>
              <Text style={styles.userName}>{getUserDisplayName()}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {spotifyTokens?.accessToken && (
          <View style={styles.spotifySection}>
            <Text style={styles.sectionTitle}>Spotify Profile</Text>
            {loadingSpotify ? (
              <ActivityIndicator color="#1DB954" />
            ) : spotifyProfile ? (
              <View style={styles.spotifyProfile}>
                <Text style={styles.spotifyName}>{spotifyProfile.display_name}</Text>
                <Text style={styles.spotifyFollowers}>
                  {spotifyProfile.followers?.total || 0} followers
                </Text>
                <Text style={styles.spotifyCountry}>
                  {spotifyProfile.country || 'Unknown location'}
                </Text>
              </View>
            ) : (
              <Text style={styles.noData}>No Spotify profile data</Text>
            )}
          </View>
        )}

        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <Text style={styles.sectionTitle}>Journal Entries</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewEntry')}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {loadingEntries ? (
            <ActivityIndicator color="#1DB954" style={styles.loading} />
          ) : entries.length > 0 ? (
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="journal-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No journal entries yet</Text>
              <Text style={styles.emptySubtext}>
                Start writing to see your entries here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  spotifySection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  spotifyProfile: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotifyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  spotifyFollowers: {
    fontSize: 14,
    color: '#666',
  },
  spotifyCountry: {
    fontSize: 14,
    color: '#666',
  },
  noData: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  entriesSection: {
    padding: 20,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#1DB954',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentimentText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  entryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  entrySummary: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 20,
  },
});

export default HomeScreen; 