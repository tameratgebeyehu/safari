import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, useColorScheme, View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { PaperProvider, Portal, Text, useTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import { darkTheme, lightTheme } from '../src/theme';
import { useAppStore } from '../src/store/appStore';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import i18n, { initI18n } from '../src/i18n';
import { initializePin } from '../src/services/PinService';
import { migrateToSecureStore } from '../src/services/SecureStorage';
import { useAutoSync } from '../src/hooks/useAutoSync';
import { initNotifications } from '../src/services/NotificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

function AppProviders({ children }: { children: React.ReactNode }) {
  const themePreference = useAppStore((s) => s.theme);
  const language = useAppStore((s) => s.language);
  const hydrate = useAppStore((s) => s.hydrate);
  const systemScheme = useColorScheme();

  useEffect(() => {
    hydrate();
    initializePin();
    initNotifications();
  }, [hydrate]);

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
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (notification) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: insets.top > 0 ? insets.top + 8 : 16,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Slide up
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setNotification(null));
      }, 5000);
    } else {
      slideAnim.setValue(-150);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, setNotification, insets.top]);

  if (!notification) return null;

  const handlePress = () => {
    if (notification.requestId) {
      const userMode = useAppStore.getState().userMode;
      if (userMode === 'receiver') {
        router.push(`/receiver/request/${notification.requestId}` as any);
      }
    }
    setNotification(null);
  };

  const getThemeColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10B981'; // Safari Green / Completed
      case 'error':
        return '#EF4444'; // Cancelled Red
      default:
        return '#3B82F6'; // Processing Blue
    }
  };

  const getIconName = () => {
    switch (notification.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'bell-ring';
    }
  };

  return (
    <Portal>
      <Animated.View
        style={[
          styles.bannerContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: theme.colors.elevation.level4,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.bannerTouchable}
        >
          <View style={[styles.iconContainer, { backgroundColor: getThemeColor() + '15' }]}>
            <MaterialCommunityIcons name={getIconName()} size={24} color={getThemeColor()} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.bannerTitle, { color: theme.colors.onSurface }]}>
              {notification.title || 'Safari A'}
            </Text>
            <Text style={[styles.bannerBody, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Animated.timing(slideAnim, {
                toValue: -150,
                duration: 200,
                useNativeDriver: true,
              }).start(() => setNotification(null));
            }}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={16} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Portal>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <SyncBootstrap />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="sender" />
            <Stack.Screen name="receiver" />
          </Stack>
          <NotificationOverlay />
        </AppProviders>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
    overflow: 'hidden',
  },
  bannerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bannerBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeButton: {
    padding: 6,
    borderRadius: 999,
  },
});
