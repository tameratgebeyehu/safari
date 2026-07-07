import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { PinGate } from '../../src/components/PinGate';

export default function ReceiverLayout() {
  const pinVerified = useAppStore((s) => s.pinVerified);
  const [unlocked, setUnlocked] = useState(pinVerified);

  // Show full-screen PIN gate until authenticated
  if (!unlocked && !pinVerified) {
    return <PinGate onSuccess={() => setUnlocked(true)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="request/[id]"
        options={{ title: 'Request Details', presentation: 'card' }}
      />
    </Stack>
  );
}
