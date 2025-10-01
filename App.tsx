import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Initialize database on app start (only for native platforms)
    if (Platform.OS !== 'web') {
      const { getDatabase } = require('./src/database/db');
      getDatabase().catch((error: Error) => {
        console.error('Failed to initialize database:', error);
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
