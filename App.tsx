import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme';
import 'react-native-url-polyfill/auto';

import { SupabaseProvider, useSupabase } from './src/contexts/SupabaseContext';
import HomeScreen from './src/screens/HomeScreen';
import NewEntryScreen from './src/screens/NewEntryScreen';
import { SpotifyAuthScreen } from './src/screens/SpotifyAuthScreen';

export type RootStackParamList = {
  Home: undefined;
  NewEntry: undefined;
  SpotifyAuth: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const NavigationContent = () => {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "SpotifyAuth"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // Authenticated stack
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NewEntry"
              component={NewEntryScreen}
              options={{ title: 'New Entry' }}
            />
          </>
        ) : (
          // Authentication stack
          <Stack.Screen
            name="SpotifyAuth"
            component={SpotifyAuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SupabaseProvider>
          <NavigationContent />
          <StatusBar style="light" />
        </SupabaseProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
}); 