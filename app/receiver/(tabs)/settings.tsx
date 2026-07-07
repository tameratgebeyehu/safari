import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
import { APP_VERSION, DEVELOPER_NAME } from '../../../src/constants';
import { useAppStore } from '../../../src/store/appStore';
import { changePin, isValidPinFormat } from '../../../src/services/PinService';
import { spacing } from '../../../src/theme/colors';

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
        <Dialog visible={pinDialogVisible} onDismiss={() => setPinDialogVisible(false)}>
          <Dialog.Title>{t('pin.changePin')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('pin.currentPin')}
              value={currentPin}
              onChangeText={(text) => setCurrentPin(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label={t('pin.newPin')}
              value={newPin}
              onChangeText={(text) => setNewPin(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label={t('pin.confirmPin')}
              value={confirmPin}
              onChangeText={(text) => setConfirmPin(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPinDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" onPress={handleChangePin}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Switch Mode Confirmation */}
        <Dialog visible={switchModeDialogVisible} onDismiss={() => setSwitchModeDialogVisible(false)}>
          <Dialog.Title>{t('settings.switchMode')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('settings.switchModeConfirm')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSwitchModeDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" onPress={handleSwitchMode}>
              {t('common.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* About */}
        <Dialog visible={aboutDialogVisible} onDismiss={() => setAboutDialogVisible(false)}>
          <Dialog.Title>{t('settings.about')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge" style={{ fontWeight: '700' }}>🦁 {t('common.appName')}</Text>
            <Text variant="bodyMedium" style={styles.aboutRow}>
              {t('settings.version')}: {APP_VERSION}
            </Text>
            <Text variant="bodyMedium" style={styles.aboutRow}>
              {t('settings.developer')}: {DEVELOPER_NAME}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAboutDialogVisible(false)}>{t('common.back')}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Privacy */}
        <Dialog visible={privacyDialogVisible} onDismiss={() => setPrivacyDialogVisible(false)}>
          <Dialog.Title>{t('settings.privacy')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('settings.privacyText')}</Text>
            <Text variant="bodyMedium" style={styles.aboutRow}>
              {t('settings.licenseText')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPrivacyDialogVisible(false)}>{t('common.back')}</Button>
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
  input: { marginBottom: spacing.sm },
  aboutRow: { marginTop: spacing.sm },
});
