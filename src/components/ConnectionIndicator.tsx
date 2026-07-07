import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';
import { spacing } from '../theme/colors';

export function ConnectionIndicator() {
  const { isConnected } = useNetworkStatus();
  const theme = useTheme();
  const { t } = useTranslation();

  // Pulse animation for online dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => pulseAnim.stopAnimation();
  }, [isConnected, pulseAnim]);

  const dotColor = isConnected ? '#4CAF50' : theme.colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.dotWrapper}>
        {isConnected && (
          <Animated.View
            style={[
              styles.dotRing,
              { borderColor: dotColor, transform: [{ scale: pulseAnim }] },
            ]}
          />
        )}
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {isConnected ? t('common.online') : t('common.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dotWrapper: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  dotRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    opacity: 0.4,
    position: 'absolute',
  },
});
