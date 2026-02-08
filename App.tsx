import 'react-native-get-random-values'; // Must be first import for uuid polyfill
import './src/localization/i18n'; // Initialize i18n
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
