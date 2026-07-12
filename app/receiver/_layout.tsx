import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../src/store/appStore';
import { PinGate } from '../../src/components/PinGate';

export default function ReceiverLayout() {
  const pinVerified = useAppStore((s) => s.pinVerified);
  const [unlocked, setUnlocked] = useState(pinVerified);
  const theme = useTheme();
  const { t } = useTranslation();

  // Show full-screen PIN gate until authenticated
  if (!unlocked && !pinVerified) {
    return <PinGate onSuccess={() => setUnlocked(true)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="request/[id]"
        options={{ title: t('requests.details') || 'Request Details', presentation: 'card' }}
      />
    </Stack>
  );
}
