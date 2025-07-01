import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '../contexts/SupabaseContext';

interface SpotifyAuthScreenProps {
  navigation: any;
}

export const SpotifyAuthScreen: React.FC<SpotifyAuthScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { signInWithSpotify } = useSupabase();

  const handleSpotifySignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithSpotify();
      
      if (error) {
        Alert.alert('Sign In Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Ionicons name="journal" size={80} color="#1DB954" />
          <Text style={styles.appName}>Modurnal</Text>
          <Text style={styles.tagline}>Your AI-Powered Journal</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="bulb" size={24} color="#1DB954" />
            <Text style={styles.featureText}>AI-powered insights</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={24} color="#1DB954" />
            <Text style={styles.featureText}>Track your mood</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={24} color="#1DB954" />
            <Text style={styles.featureText}>Secure & private</Text>
          </View>
        </View>

        {/* Spotify Sign In Button */}
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[styles.spotifyButton, loading && styles.buttonDisabled]}
            onPress={handleSpotifySignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="musical-notes" size={24} color="#ffffff" />
                <Text style={styles.spotifyButtonText}>Sign in with Spotify</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Spotify OAuth & Supabase
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#b3b3b3',
    marginTop: 8,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
    fontWeight: '500',
  },
  authContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  spotifyButton: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    minWidth: 280,
    shadowColor: '#1DB954',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  spotifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 