import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/appStore';
import type { UserMode } from '../src/constants';
import { spacing, borderRadius, typography } from '../src/theme/colors';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { hasLaunched, userMode, setUserMode, setHasLaunched, hydrate, setPinVerified, language, setLanguage } =
    useAppStore();
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (hasLaunched && userMode) {
      router.replace((userMode === 'sender' ? '/sender' : '/receiver') as any);
    }
  }, [ready, hasLaunched, userMode]);

  const handleSelectSender = useCallback(() => setSelectedMode('sender'), []);
  const handleSelectReceiver = useCallback(() => setSelectedMode('receiver'), []);

  const handleContinue = () => {
    if (!selectedMode) return;
    setPinVerified(false);
    setUserMode(selectedMode);
    setHasLaunched(true);
    router.replace((selectedMode === 'sender' ? '/sender' : '/receiver') as any);
  };

  if (!ready || (hasLaunched && userMode)) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <Image source={require('../assets/logo.png')} style={styles.splashLogo} resizeMode="contain" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <Button
          mode="outlined"
          onPress={() => setLanguage(language === 'en' ? 'am' : 'en')}
          style={{ borderColor: theme.colors.outlineVariant, borderRadius: 20 }}
          labelStyle={{ fontWeight: '800', fontSize: 13 }}
        >
          {language === 'en' ? 'አማርኛ (Amharic)' : 'English'}
        </Button>
      </View>

      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
          {t('common.appName')}
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('welcome.subtitle')}
        </Text>
      </View>

      <View style={styles.cards}>
        <Pressable onPress={handleSelectSender}>
          <Card
            style={[
              styles.modeCard,
              selectedMode === 'sender' && {
                borderColor: theme.colors.primary,
                borderWidth: 2.5,
              },
            ]}
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardEmoji}>📤</Text>
              <Text variant="titleLarge" style={styles.cardTitle}>
                {t('welcome.senderMode')}
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.cardDesc, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('welcome.senderDescription')}
              </Text>
            </Card.Content>
          </Card>
        </Pressable>

        <Pressable onPress={handleSelectReceiver}>
          <Card
            style={[
              styles.modeCard,
              selectedMode === 'receiver' && {
                borderColor: theme.colors.primary,
                borderWidth: 2.5,
              },
            ]}
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardEmoji}>📥</Text>
              <Text variant="titleLarge" style={styles.cardTitle}>
                {t('welcome.receiverMode')}
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.cardDesc, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('welcome.receiverDescription')}
              </Text>
            </Card.Content>
          </Card>
        </Pressable>
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        disabled={!selectedMode}
        style={styles.continueBtn}
        contentStyle={styles.continueBtnContent}
        labelStyle={styles.continueLabel}
        icon="arrow-right"
      >
        {t('welcome.continue')}
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoImage: {
    width: 96,
    height: 96,
    marginBottom: spacing.md,
    borderRadius: 22,
  },
  splashLogo: {
    width: 120,
    height: 120,
    borderRadius: 26,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  cards: {
    gap: spacing.md,
  },
  modeCard: {
    borderRadius: borderRadius.lg,
  },
  cardContent: {
    paddingVertical: spacing.md,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  cardDesc: {
    opacity: 0.8,
  },
  continueBtn: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  continueBtnContent: {
    paddingVertical: spacing.sm,
  },
  continueLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.xs,
  },
});
