import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCreateRequest } from '../../src/hooks/useRequests';
import { useLatestSenderRequest } from '../../src/hooks/useLatestSenderRequest';
import { useAppStore } from '../../src/store/appStore';
import { getEthiopianDateTime } from '../../src/utils/ethiopianDate';
import { isValidEthiopianPhone, normalizePhoneNumber } from '../../src/utils/phone';
import { generateRequestId } from '../../src/utils/requestId';
import { QUICK_AMOUNTS } from '../../src/constants';
import { colors, spacing, borderRadius } from '../../src/theme/colors';
import { getStatusColor } from '../../src/utils/requestHelpers';
import { formatPhoneDisplay } from '../../src/utils/phone';

const STATUS_ICONS: Record<string, string> = {
  Pending: 'clock-outline',
  Processing: 'progress-clock',
  Completed: 'check-circle-outline',
  Cancelled: 'close-circle-outline',
};

export default function SenderScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const phoneRef = useRef<RNTextInput>(null);

  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const description = '';
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const successOpacity = useRef(new Animated.Value(0)).current;
  const createRequest = useCreateRequest();
  const { setLatestRequest, language, setLanguage } = useAppStore();
  const { latestRequest, statusChange, clearStatusChange } = useLatestSenderRequest();

  // Status change notifications
  useEffect(() => {
    if (!statusChange) return;
    if (statusChange === 'Completed') setSnackbar(t('sender.notificationCompleted'));
    else if (statusChange === 'Processing') setSnackbar(t('sender.notificationProcessing'));
    else if (statusChange === 'Cancelled') setSnackbar(t('sender.notificationCancelled'));
    clearStatusChange();
  }, [statusChange]);

  // Auto-focus phone field
  useEffect(() => {
    const timer = setTimeout(() => phoneRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const showSuccessAnim = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  const clearFields = useCallback(() => {
    setPhone('');
    setAmount('');
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
    const n = parseInt(amount, 10);
    if (!amount || isNaN(n) || n <= 0) {
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
      setSnackbar(result.pendingSync ? t('sender.savedOffline') : t('sender.success'));
      if (!result.pendingSync) showSuccessAnim();
      clearFields();
    } catch {
      setSnackbar(t('common.error'));
    }
  };

  const handleClear = () => {
    clearFields();
    setSnackbar(t('sender.clearFields'));
  };

  const statusColor = latestRequest ? getStatusColor(latestRequest.status) : colors.pending;
  const statusIcon = latestRequest ? (STATUS_ICONS[latestRequest.status] || 'help-circle-outline') : '';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {t('common.appName')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.langToggleBtn}
          onPress={() => setLanguage(language === 'en' ? 'am' : 'en')}
        >
          <Text style={[styles.langToggleText, { color: theme.colors.primary }]}>
            {language === 'en' ? 'አማርኛ' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Success Banner ── */}
        {showSuccess && (
          <Animated.View
            style={[styles.successBanner, { backgroundColor: colors.completed + '18', opacity: successOpacity }]}
          >
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.completed} />
            <Text style={[styles.successText, { color: colors.completed }]}>
              {t('sender.success')}
            </Text>
          </Animated.View>
        )}

        {/* ── Phone Field ── */}
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
          {t('sender.phoneLabel')}
        </Text>
        <View
          style={[
            styles.inputBox,
            {
              borderColor: phoneError
                ? colors.cancelled
                : phone.length > 0
                ? theme.colors.primary
                : theme.colors.outline,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="phone"
            size={22}
            color={phoneError ? colors.cancelled : theme.colors.onSurfaceVariant}
            style={styles.inputIcon}
          />
          <RNTextInput
            ref={phoneRef}
            style={[styles.input, { color: theme.colors.onSurface }]}
            placeholder={t('sender.phonePlaceholder')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={phone}
            onChangeText={(t) => {
              setPhone(t.replace(/[^\d+]/g, ''));
              if (phoneError) setPhoneError('');
            }}
            keyboardType="phone-pad"
            accessibilityLabel={t('sender.phoneLabel')}
          />
          {phone.length > 0 && (
            <TouchableOpacity onPress={() => setPhone('')} style={styles.clearIcon}>
              <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
        {!!phoneError && (
          <Text style={styles.errorText}>
            <MaterialCommunityIcons name="alert-circle-outline" size={13} /> {phoneError}
          </Text>
        )}

        {/* ── Quick Amounts ── */}
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurface, marginTop: 20 }]}>
          {t('sender.amountLabel')}
        </Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((val) => {
            const selected = amount === String(val);
            return (
              <TouchableOpacity
                key={val}
                style={[
                  styles.amountChip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.outline,
                  },
                ]}
                onPress={() => {
                  setAmount(String(val));
                  if (amountError) setAmountError('');
                }}
              >
                <Text
                  style={[
                    styles.amountChipText,
                    { color: selected ? '#fff' : theme.colors.onSurface },
                  ]}
                >
                  {val}
                </Text>
                <Text
                  style={[
                    styles.amountChipUnit,
                    { color: selected ? '#ffffffbb' : theme.colors.onSurfaceVariant },
                  ]}
                >
                  {t('common.currency')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Manual Amount ── */}
        <View
          style={[
            styles.inputBox,
            {
              borderColor: amountError
                ? colors.cancelled
                : amount.length > 0
                ? theme.colors.primary
                : theme.colors.outline,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="cash"
            size={22}
            color={amountError ? colors.cancelled : theme.colors.onSurfaceVariant}
            style={styles.inputIcon}
          />
          <RNTextInput
            style={[styles.input, { color: theme.colors.onSurface }]}
            placeholder={t('sender.amountHint')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={amount}
            onChangeText={(t) => {
              setAmount(t.replace(/\D/g, ''));
              if (amountError) setAmountError('');
            }}
            keyboardType="number-pad"
            accessibilityLabel={t('sender.amountLabel')}
          />
          <Text style={[styles.etbTag, { color: theme.colors.onSurfaceVariant }]}>{t('common.currency')}</Text>
        </View>
        {!!amountError && (
          <Text style={styles.errorText}>
            <MaterialCommunityIcons name="alert-circle-outline" size={13} /> {amountError}
          </Text>
        )}



        {/* ── Send Button ── */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: createRequest.isPending
                ? theme.colors.surfaceVariant
                : theme.colors.primary,
            },
          ]}
          onPress={handleSend}
          disabled={createRequest.isPending}
          accessibilityLabel={t('sender.send')}
        >
          <MaterialCommunityIcons
            name={createRequest.isPending ? 'loading' : 'send'}
            size={22}
            color="#fff"
          />
          <Text style={styles.sendBtnText}>
            {createRequest.isPending ? t('sender.sending') : t('sender.send')}
          </Text>
        </TouchableOpacity>

        {/* ── Clear Button ── */}
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClear}
          disabled={createRequest.isPending}
          accessibilityLabel={t('sender.clearBtn')}
        >
          <MaterialCommunityIcons name="refresh" size={18} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.clearBtnText, { color: theme.colors.onSurfaceVariant }]}>
            {t('sender.clearBtn')}
          </Text>
        </TouchableOpacity>

        {/* ── Latest Request Card ── */}
        {latestRequest && (
          <View style={[styles.latestCard, { backgroundColor: theme.colors.surface, borderColor: statusColor + '44' }]}>
            <View style={[styles.latestBar, { backgroundColor: statusColor }]} />
            <View style={styles.latestContent}>
              <Text style={[styles.latestLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('sender.latestStatus')}
              </Text>
              <View style={styles.latestRow}>
                <MaterialCommunityIcons name="phone" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.latestPhone, { color: theme.colors.onSurface }]}>
                  {formatPhoneDisplay(latestRequest.buyerPhone)}
                </Text>
                <Text style={[styles.latestAmount, { color: theme.colors.primary }]}>
                  {latestRequest.amount} {t('common.currency')}
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: statusColor + '22' }]}>
                <MaterialCommunityIcons name={statusIcon as any} size={14} color={statusColor} />
                <Text style={[styles.statusPillText, { color: statusColor }]}>
                  {t(`requests.status${latestRequest.status}`)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
        style={{ borderRadius: 12 }}
      >
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  historyBtnText: { fontSize: 13, fontWeight: '700' },

  // Scroll
  scroll: { padding: 20, paddingBottom: 48 },

  // Success
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: { fontSize: 15, fontWeight: '700' },

  // Fields
  fieldLabel: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 56,
    marginBottom: 4,
  },
  descBox: { alignItems: 'flex-start', minHeight: 90 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 17, paddingVertical: 12 },
  descInput: { paddingTop: 14, textAlignVertical: 'top', minHeight: 70 },
  clearIcon: { padding: 4 },
  etbTag: { fontSize: 14, fontWeight: '700', marginLeft: 6 },
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 8, marginLeft: 4 },
  charCount: { fontSize: 12, textAlign: 'right', marginBottom: 8 },

  // Quick amounts
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  amountChip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  amountChipText: { fontSize: 18, fontWeight: '800' },
  amountChipUnit: { fontSize: 11, fontWeight: '600', marginTop: 1 },

  // Buttons
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    minHeight: 58,
    marginTop: 24,
  },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
  },
  clearBtnText: { fontSize: 14, fontWeight: '600' },

  // Latest card
  latestCard: {
    flexDirection: 'row',
    marginTop: 28,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  latestBar: { width: 4 },
  latestContent: { flex: 1, padding: 14, gap: 6 },
  latestLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  latestRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  latestPhone: { fontSize: 15, fontWeight: '700', flex: 1 },
  latestAmount: { fontSize: 15, fontWeight: '800' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  langToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  langToggleText: {
    fontSize: 13,
    fontWeight: '800',
  },
});