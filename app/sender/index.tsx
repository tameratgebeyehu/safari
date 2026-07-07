import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Button, IconButton, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ConnectionIndicator } from '../../src/components/ConnectionIndicator';
import { LatestRequestCard } from '../../src/components/LatestRequestCard';
import { QUICK_AMOUNTS, MAX_DESCRIPTION_LENGTH } from '../../src/constants';
import { useCreateRequest } from '../../src/hooks/useRequests';
import { useLatestSenderRequest } from '../../src/hooks/useLatestSenderRequest';
import { useAppStore } from '../../src/store/appStore';
import { getEthiopianDateTime } from '../../src/utils/ethiopianDate';
import { isValidEthiopianPhone, normalizePhoneNumber } from '../../src/utils/phone';
import { generateRequestId } from '../../src/utils/requestId';
import { spacing, borderRadius, typography, colors } from '../../src/theme/colors';

function getTimeBasedGreetingKey(): 'sender.greetingMorning' | 'sender.greetingAfternoon' | 'sender.greetingEvening' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'sender.greetingMorning';
  if (hour >= 12 && hour < 17) return 'sender.greetingAfternoon';
  return 'sender.greetingEvening';
}

export default function SenderScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const phoneRef = useRef<RNTextInput>(null);

  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateTime, setDateTime] = useState(getEthiopianDateTime());
  const [greetingKey] = useState(getTimeBasedGreetingKey());

  const successScale = useRef(new Animated.Value(0)).current;
  const createRequest = useCreateRequest();
  const setLatestRequest = useAppStore((s) => s.setLatestRequest);

  const { latestRequest, statusChange, clearStatusChange } = useLatestSenderRequest();

  useEffect(() => {
    if (!statusChange) return;
    if (statusChange === 'Completed') {
      setSnackbar(t('sender.notificationCompleted'));
    } else if (statusChange === 'Processing') {
      setSnackbar(t('sender.notificationProcessing'));
    } else if (statusChange === 'Cancelled') {
      setSnackbar(t('sender.notificationCancelled'));
    }
    clearStatusChange();
  }, [statusChange, t]);

  // Auto-focus phone input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      phoneRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Update Ethiopian time every minute
  useEffect(() => {
    const interval = setInterval(() => setDateTime(getEthiopianDateTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.delay(1500),
      Animated.timing(successScale, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  const clearFields = useCallback(() => {
    setPhone('');
    setAmount('');
    setDescription('');
    setPhoneError('');
    setAmountError('');
    setTimeout(() => phoneRef.current?.focus(), 100);
  }, []);

  const validate = (): boolean => {
    let valid = true;
    if (!isValidEthiopianPhone(phone)) {
      setPhoneError(t('sender.phoneError'));
      valid = false;
    } else {
      setPhoneError('');
    }

    const amountNum = parseInt(amount, 10);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setAmountError(t('sender.amountError'));
      valid = false;
    } else {
      setAmountError('');
    }

    return valid;
  };

  const handleSend = async () => {
    if (!validate() || createRequest.isPending) return;

    const ethDateTime = getEthiopianDateTime();
    const payload = {
      requestId: generateRequestId(),
      buyerPhone: normalizePhoneNumber(phone),
      amount: parseInt(amount, 10),
      description: description.trim(),
      createdDate: ethDateTime.ethiopianDate,
      createdTime: ethDateTime.ethiopianTime,
      isoTimestamp: ethDateTime.isoTimestamp,
      userMode: 'sender',
    };

    try {
      const result = await createRequest.mutateAsync(payload);
      setLatestRequest({
        requestId: result.requestId,
        buyerPhone: result.buyerPhone,
        amount: result.amount,
        createdDate: result.createdDate,
        createdTime: result.createdTime,
        status: result.status,
      });
      if (result.pendingSync) {
        setSnackbar(t('sender.savedOffline'));
      } else {
        setSnackbar(t('sender.success'));
        showSuccessAnimation();
      }
      clearFields();
    } catch {
      setSnackbar(t('common.error'));
    }
  };

  const handleCancel = () => {
    clearFields();
    setSnackbar(t('sender.clearFields'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="history"
            size={28}
            onPress={() => router.push('/sender/history' as any)}
            style={styles.historyBtn}
            iconColor={theme.colors.primary}
          />
          <Text style={styles.logo}>🦁</Text>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            {t('common.appName')}
          </Text>
          <Text variant="titleSmall" style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>
            {t(greetingKey)}
          </Text>
          <View style={styles.dateRow}>
            <Text variant="bodyMedium" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
              📅 {dateTime.ethiopianDate}
            </Text>
            <Text variant="bodyMedium" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
              🕐 {dateTime.ethiopianTime}
            </Text>
          </View>
          <ConnectionIndicator />
        </View>

        {/* Success Overlay */}
        {showSuccess && (
          <Animated.View style={[styles.successBadge, { transform: [{ scale: successScale }] }]}>
            <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
            <Text variant="titleMedium" style={{ color: colors.success, fontWeight: '700' }}>
              {t('sender.success')}
            </Text>
          </Animated.View>
        )}

        {/* Phone Input */}
        <TextInput
          ref={phoneRef as never}
          label={t('sender.phoneLabel')}
          placeholder={t('sender.phonePlaceholder')}
          value={phone}
          onChangeText={(text) => {
            setPhone(text.replace(/[^\d+]/g, ''));
            if (phoneError) setPhoneError('');
          }}
          keyboardType="phone-pad"
          mode="outlined"
          error={!!phoneError}
          style={styles.input}
          contentStyle={styles.inputContent}
          right={
            phone.length > 0 ? (
              <TextInput.Icon icon="close-circle" onPress={() => setPhone('')} />
            ) : undefined
          }
        />
        {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

        {/* Quick Amount Buttons */}
        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
          {t('sender.amountLabel')}
        </Text>
        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((value) => (
            <Button
              key={value}
              mode={amount === String(value) ? 'contained' : 'outlined'}
              onPress={() => {
                setAmount(String(value));
                if (amountError) setAmountError('');
              }}
              style={styles.amountBtn}
              contentStyle={styles.amountBtnContent}
              labelStyle={styles.amountBtnLabel}
            >
              {value} ETB
            </Button>
          ))}
        </View>

        {/* Manual Amount Input */}
        <TextInput
          label={t('sender.amountLabel')}
          value={amount}
          onChangeText={(text) => {
            setAmount(text.replace(/\D/g, ''));
            if (amountError) setAmountError('');
          }}
          keyboardType="number-pad"
          mode="outlined"
          error={!!amountError}
          style={styles.input}
          contentStyle={styles.inputContent}
          right={<TextInput.Affix text="ETB" />}
        />
        {amountError ? <Text style={styles.error}>{amountError}</Text> : null}

        {/* Description */}
        <TextInput
          label={t('sender.descriptionLabel')}
          placeholder={t('sender.descriptionPlaceholder')}
          value={description}
          onChangeText={(text) => setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH))}
          mode="outlined"
          multiline
          maxLength={MAX_DESCRIPTION_LENGTH}
          style={styles.input}
          contentStyle={styles.descriptionContent}
        />
        <Text variant="labelSmall" style={[styles.charCount, { color: theme.colors.onSurfaceVariant }]}>
          {description.length}/{MAX_DESCRIPTION_LENGTH}
        </Text>

        {/* Send Button */}
        <Button
          mode="contained"
          onPress={handleSend}
          loading={createRequest.isPending}
          disabled={createRequest.isPending}
          style={[styles.sendBtn, { backgroundColor: colors.success }]}
          contentStyle={styles.actionBtnContent}
          labelStyle={styles.actionLabel}
          icon="send"
        >
          {createRequest.isPending ? t('sender.sending') : t('sender.send')}
        </Button>

        {/* Cancel Button */}
        <Button
          mode="contained"
          onPress={handleCancel}
          disabled={createRequest.isPending}
          style={[styles.cancelBtn, { backgroundColor: colors.accent }]}
          contentStyle={styles.actionBtnContent}
          labelStyle={styles.actionLabel}
          icon="close"
        >
          {t('sender.cancel')}
        </Button>

        {/* Latest Request Status */}
        {latestRequest && <LatestRequestCard request={latestRequest} />}
      </ScrollView>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.lg, position: 'relative' },
  historyBtn: { position: 'absolute', right: -spacing.sm, top: -spacing.sm },
  logo: { fontSize: 52, marginBottom: spacing.xs },
  greeting: { marginTop: spacing.xs, textAlign: 'center' },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateText: { opacity: 0.85 },
  successBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  input: { marginBottom: spacing.xs },
  inputContent: { fontSize: typography.senderInput, minHeight: 56 },
  descriptionContent: { fontSize: typography.body },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm, fontWeight: '600' },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amountBtn: { borderRadius: borderRadius.lg, minHeight: 48, minWidth: 80 },
  amountBtnContent: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  amountBtnLabel: { fontSize: 17, fontWeight: '700' },
  error: { color: colors.accent, marginBottom: spacing.sm, fontSize: typography.caption },
  charCount: { textAlign: 'right', marginBottom: spacing.md },
  sendBtn: { borderRadius: borderRadius.lg, marginTop: spacing.md },
  cancelBtn: { borderRadius: borderRadius.lg, marginTop: spacing.sm },
  actionBtnContent: { paddingVertical: 16 },
  actionLabel: { fontSize: typography.senderBody, fontWeight: '700' },
});
