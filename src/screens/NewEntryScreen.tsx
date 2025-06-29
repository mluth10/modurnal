import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { useSupabase } from '../contexts/SupabaseContext';
import { JournalService } from '../services/journal';

type NewEntryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NewEntry'>;

interface NewEntryScreenProps {
  navigation: NewEntryScreenNavigationProp;
}

const NewEntryScreen: React.FC<NewEntryScreenProps> = ({ navigation }) => {
  const { supabase } = useSupabase();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const journalService = new JournalService(supabase);
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
              {/* <Ionicons name="sparkles-outline" size={20} color="#007AFF" /> */}
              <Text style={styles.infoText}>
                Your entry will be automatically analyzed for sentiment and summarized
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
});

export default NewEntryScreen; 