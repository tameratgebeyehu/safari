import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  RadioButton,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_VERSION, DEVELOPER_NAME } from '../../../src/constants';
import { useAppStore } from '../../../src/store/appStore';
import { changePin, isValidPinFormat } from '../../../src/services/PinService';
import { spacing, colors, borderRadius } from '../../../src/theme/colors';

export default function SettingsScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { theme: themePref, language, setTheme, setLanguage, setUserMode, setHasLaunched } = useAppStore();

  const [pinDialogVisible, setPinDialogVisible] = useState(false);
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false);
  const [privacyDialogVisible, setPrivacyDialogVisible] = useState(false);
  const [switchModeDialogVisible, setSwitchModeDialogVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const handleChangePin = () => {
    if (!isValidPinFormat(newPin)) {
      setSnackbar(t('pin.pinInvalid'));
      return;
    }
    if (newPin !== confirmPin) {
      setSnackbar(t('pin.pinMismatch'));
      return;
    }
    if (changePin(currentPin, newPin)) {
      setSnackbar(t('pin.pinChanged'));
      setPinDialogVisible(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setSnackbar(t('pin.error'));
    }
  };

  const handleLanguageChange = (lang: 'en' | 'am') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleSwitchMode = () => {
    setSwitchModeDialogVisible(false);
    // Clear mode selection so the welcome screen re-shows
    setHasLaunched(false);
    setUserMode('sender'); // reset temporarily, welcome will overwrite
    router.replace('/');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Appearance */}
      <List.Section>
        <List.Subheader>{t('settings.theme')}</List.Subheader>
        <RadioButton.Group onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')} value={themePref}>
          <List.Item
            title={t('settings.themeLight')}
            left={(props) => <List.Icon {...props} icon="weather-sunny" />}
            right={() => <RadioButton value="light" />}
            onPress={() => setTheme('light')}
          />
          <List.Item
            title={t('settings.themeDark')}
            left={(props) => <List.Icon {...props} icon="weather-night" />}
            right={() => <RadioButton value="dark" />}
            onPress={() => setTheme('dark')}
          />
          <List.Item
            title={t('settings.themeSystem')}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => <RadioButton value="system" />}
            onPress={() => setTheme('system')}
          />
        </RadioButton.Group>
      </List.Section>

      <Divider />

      {/* Language */}
      <List.Section>
        <List.Subheader>{t('settings.language')}</List.Subheader>
        <RadioButton.Group onValueChange={(v) => handleLanguageChange(v as 'en' | 'am')} value={language}>
          <List.Item
            title={t('settings.languageEn')}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={() => <RadioButton value="en" />}
            onPress={() => handleLanguageChange('en')}
          />
          <List.Item
            title={t('settings.languageAm')}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={() => <RadioButton value="am" />}
            onPress={() => handleLanguageChange('am')}
          />
        </RadioButton.Group>
      </List.Section>

      <Divider />

      {/* Account */}
      <List.Section>
        <List.Subheader>{t('settings.account')}</List.Subheader>
        <List.Item
          title={t('pin.changePin')}
          description="Change your 4-digit access PIN"
          left={(props) => <List.Icon {...props} icon="lock" />}
          onPress={() => setPinDialogVisible(true)}
        />
        <List.Item
          title={t('settings.switchMode')}
          description="Switch between Sender and Receiver modes"
          left={(props) => <List.Icon {...props} icon="swap-horizontal" />}
          onPress={() => setSwitchModeDialogVisible(true)}
        />
      </List.Section>

      <Divider />

      {/* About */}
      <List.Section>
        <List.Subheader>{t('settings.about')}</List.Subheader>
        <List.Item
          title={t('settings.about')}
          description={`${t('settings.version')}: ${APP_VERSION}`}
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => setAboutDialogVisible(true)}
        />
        <List.Item
          title={t('settings.privacy')}
          left={(props) => <List.Icon {...props} icon="shield-check" />}
          onPress={() => setPrivacyDialogVisible(true)}
        />
        <List.Item
          title={t('settings.license')}
          left={(props) => <List.Icon {...props} icon="file-document" />}
          onPress={() => setPrivacyDialogVisible(true)}
        />
      </List.Section>

      {/* ── Dialogs ── */}
      <Portal>
        {/* Change PIN */}
        <Dialog
          visible={pinDialogVisible}
          onDismiss={() => setPinDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="lock-reset" size={24} color={colors.primary} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
                {t('pin.changePin')}
              </Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label={t('pin.currentPin')}
              value={currentPin}
              onChangeText={(text) => setCurrentPin(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label={t('pin.newPin')}
              value={newPin}
              onChangeText={(text) => setNewPin(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label={t('pin.confirmPin')}
              value={confirmPin}
              onChangeText={(text) => setConfirmPin(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPinDialogVisible(false)} labelStyle={{ color: theme.colors.onSurfaceVariant }}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" onPress={handleChangePin} buttonColor={colors.primary} style={{ borderRadius: 12 }}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Switch Mode Confirmation */}
        <Dialog
          visible={switchModeDialogVisible}
          onDismiss={() => setSwitchModeDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="swap-horizontal-bold" size={24} color={colors.primary} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
                {t('settings.switchMode')}
              </Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium" style={{ lineHeight: 20, color: theme.colors.onSurfaceVariant }}>
              {t('settings.switchModeConfirm')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSwitchModeDialogVisible(false)} labelStyle={{ color: theme.colors.onSurfaceVariant }}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" onPress={handleSwitchMode} buttonColor={colors.primary} style={{ borderRadius: 12 }}>
              {t('common.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* About */}
        <Dialog
          visible={aboutDialogVisible}
          onDismiss={() => setAboutDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="information-outline" size={24} color={colors.primary} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
                {t('settings.about')}
              </Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {/* App Card */}
            <View style={[styles.aboutCard, { backgroundColor: theme.colors.surfaceVariant + '40', borderColor: theme.colors.outlineVariant }]}>
              <Image source={require('../../../assets/logo.png')} style={styles.aboutLogo} resizeMode="contain" />
              <View style={styles.aboutInfo}>
                <Text style={[styles.aboutAppName, { color: theme.colors.onSurface }]}>
                  {t('common.appName')}
                </Text>
                <View style={[styles.aboutVersionBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                    {t('settings.version')} {APP_VERSION}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Grid */}
            <View style={[styles.aboutDetailRow, { borderBottomColor: theme.colors.outlineVariant }]}>
              <MaterialCommunityIcons name="account-cog-outline" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.aboutDetailText, { color: theme.colors.onSurfaceVariant, flex: 1 }]}>
                {t('settings.developer')}
              </Text>
              <Text style={[styles.aboutDetailText, { color: theme.colors.onSurface, fontWeight: '700' }]}>
                {DEVELOPER_NAME}
              </Text>
            </View>
            <View style={[styles.aboutDetailRow, { borderBottomColor: 'transparent' }]}>
              <MaterialCommunityIcons name="check-decagram-outline" size={18} color={colors.completed} />
              <Text style={[styles.aboutDetailText, { color: theme.colors.onSurfaceVariant, flex: 1 }]}>
                Status
              </Text>
              <Text style={[styles.aboutDetailText, { color: colors.completed, fontWeight: '700' }]}>
                Production Ready
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAboutDialogVisible(false)} labelStyle={{ color: colors.primary, fontWeight: '700' }}>
              {t('common.back')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Privacy */}
        <Dialog
          visible={privacyDialogVisible}
          onDismiss={() => setPrivacyDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.primary} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
                {t('settings.privacy')}
              </Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text style={[styles.privacyText, { color: theme.colors.onSurfaceVariant }]}>
              {t('settings.privacyText')}
            </Text>
            <View style={[styles.licenseBox, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.licenseText, { color: colors.primary }]}>
                {t('settings.licenseText')}
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPrivacyDialogVisible(false)} labelStyle={{ color: colors.primary, fontWeight: '700' }}>
              {t('common.back')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dialog: {
    borderRadius: 24,
    paddingVertical: spacing.xs,
  },
  dialogTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xs,
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.3,
  },
  dialogContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  input: {
    marginBottom: spacing.sm,
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  aboutLogo: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  aboutInfo: {
    flex: 1,
    gap: 4,
  },
  aboutAppName: {
    fontWeight: '800',
    fontSize: 18,
  },
  aboutVersionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aboutDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  aboutDetailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  licenseBox: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  licenseText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
