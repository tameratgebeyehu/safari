import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { verifyPin } from '../services/PinService';
import { useAppStore } from '../store/appStore';
import { spacing, colors, borderRadius } from '../theme/colors';

interface PinGateProps {
  onSuccess: () => void;
}

export function PinGate({ onSuccess }: PinGateProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const setPinVerified = useAppStore((s) => s.setPinVerified);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (verifyPin(pin)) {
        setError(false);
        setPinVerified(true);
        onSuccess();
      } else {
        setError(true);
        shake();
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const isDark = theme.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Logo / Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🦁</Text>
        <Text variant="headlineMedium" style={[styles.appName, { color: theme.colors.primary }]}>
          Safari A
        </Text>
        <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('pin.title')}
        </Text>
        <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          {t('pin.subtitle')}
        </Text>
      </View>

      {/* PIN Dot Indicators */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < pin.length
                    ? error
                      ? theme.colors.error
                      : theme.colors.primary
                    : isDark
                    ? '#333333'
                    : '#E0E0E0',
                borderColor: error ? theme.colors.error : theme.colors.primary,
              },
            ]}
          />
        ))}
      </Animated.View>

      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {t('pin.error')}
        </Text>
      )}

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, idx) => {
          if (key === '') {
            return <View key={idx} style={styles.keyPlaceholder} />;
          }
          return (
            <View key={idx} style={styles.keyWrapper}>
              <Text
                style={[
                  styles.key,
                  {
                    color: key === '⌫' ? theme.colors.error : theme.colors.onSurface,
                    backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
                  },
                ]}
                onPress={() => {
                  if (key === '⌫') {
                    handleBackspace();
                  } else {
                    handleDigit(key);
                  }
                }}
              >
                {key}
              </Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  appName: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hint: {
    opacity: 0.6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  errorText: {
    color: '#D32F2F',
    marginTop: -spacing.md,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    gap: spacing.md,
    justifyContent: 'center',
  },
  keyWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
  },
  keyPlaceholder: {
    width: 72,
    height: 72,
  },
});
