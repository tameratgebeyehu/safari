import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider, Portal, Snackbar } from 'react-native-paper';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import { darkTheme, lightTheme } from '../src/theme';
import { useAppStore } from '../src/store/appStore';
import i18n, { initI18n } from '../src/i18n';
import { initializePin } from '../src/services/PinService';
import { useAutoSync } from '../src/hooks/useAutoSync';
import { queryPersister } from '../src/storage/queryPersister';

initI18n();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const persistOptions = {
  persister: queryPersister,
  maxAge: 1000 * 60 * 60 * 24,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: readonly unknown[] }) =>
      query.queryKey[0] === 'requests' || query.queryKey[0] === 'favorites',
  },
};

function AppProviders({ children }: { children: React.ReactNode }) {
  const themePreference = useAppStore((s) => s.theme);
  const language = useAppStore((s) => s.language);
  const hydrate = useAppStore((s) => s.hydrate);
  const systemScheme = useColorScheme();

  useEffect(() => {
    hydrate();
    initializePin();
  }, [hydrate, initializePin]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemScheme === 'dark');

  return (
    <I18nextProvider i18n={i18n}>
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </PaperProvider>
    </I18nextProvider>
  );
}

function SyncBootstrap() {
  useAutoSync();
  return null;
}

function NotificationOverlay() {
  const notification = useAppStore((s) => s.notification);
  const setNotification = useAppStore((s) => s.setNotification);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (notification) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setNotification(null), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, setNotification]);

  const getSnackbarColor = () => {
    if (!notification) return undefined;
    switch (notification.type) {
      case 'success': return '#2E7D32';
      case 'error': return '#D32F2F';
      default: return undefined;
    }
  };

  return (
    <Portal>
      <Snackbar
        visible={!!notification}
        onDismiss={() => setNotification(null)}
        duration={3000}
        style={notification?.type ? { backgroundColor: getSnackbarColor() } : undefined}
      >
        {notification?.message ?? ''}
      </Snackbar>
    </Portal>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <AppProviders>
          <SyncBootstrap />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="sender/index" />
            <Stack.Screen name="receiver" />
          </Stack>
          <NotificationOverlay />
        </AppProviders>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
