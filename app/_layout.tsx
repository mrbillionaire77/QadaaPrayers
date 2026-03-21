import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { PrayerProvider } from '@/contexts/PrayerContext';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Enable RTL for Arabic
I18nManager.allowRTL(true);

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <PrayerProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </PrayerProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
