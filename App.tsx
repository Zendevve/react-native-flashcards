import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Initialize database on app start
    if (Platform.OS !== 'web') {
      // Use SQLite for native platforms
      const { getDatabase } = require('./src/database/db');
      getDatabase().catch((error: Error) => {
        console.error('Failed to initialize database:', error);
      });
    } else {
      // Use mock data for web demo
      console.log('Running in web demo mode with sample data');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
