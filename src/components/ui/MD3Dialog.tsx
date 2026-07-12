import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Dialog, DialogProps, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface MD3DialogProps extends Omit<DialogProps, 'style' | 'contentStyle' | 'titleStyle' | 'actionsStyle'> {
  title?: string;
  subtitle?: string;
  titleIcon?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const MD3Dialog: React.FC<MD3DialogProps> = ({
  visible,
  onDismiss,
  title,
  subtitle,
  titleIcon,
  children,
  actions,
  style,
  contentStyle,
  ...props
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      style={[
        {
          margin: 24,
          borderRadius: 28,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
      {...(props as any)}
    >
      {(title || subtitle || titleIcon) && (
        <View style={styles.header}>
          {titleIcon && (
            <View style={styles.titleIconContainer}>
              <MaterialCommunityIcons name={titleIcon as IconName} size={24} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.titleContainer}>
            {title && <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>}
            {subtitle && <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant, marginTop: 4 }]}>{subtitle}</Text>}
          </View>
        </View>
      )}
      <View style={[styles.content, { padding: 24 }, contentStyle]}>{children}</View>
      {actions && (
        <View style={styles.actions}>
          {React.Children.map(actions, (action) =>
            React.isValidElement(action)
              ? React.cloneElement(action as React.ReactElement<any>, {
                  style: [
                    { marginLeft: 8, minWidth: 80 },
                    (action.props as any).style,
                  ],
                })
              : action
          )}
        </View>
      )}
    </Dialog>
  );
};

export interface MD3AlertDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message?: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  destructive?: boolean;
}

export const MD3AlertDialog: React.FC<MD3AlertDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  icon = 'alert-circle-outline',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  destructive = false,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.alertDialog}>
      <View style={styles.alertContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon as IconName} size={40} color={destructive ? theme.colors.error : theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={[styles.alertTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {message && <Text variant="bodyMedium" style={[styles.alertMessage, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>}
      </View>
      <View style={styles.alertActions}>
        <Button mode="text" onPress={onDismiss} style={styles.alertAction}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{cancelText}</Text>
        </Button>
        <Button
          mode={destructive ? 'contained' : 'contained'}
          onPress={() => { onConfirm?.(); onDismiss(); }}
          style={styles.alertAction}
        >
          <Text style={{ color: destructive ? theme.colors.onError : theme.colors.onPrimary }}>{confirmText}</Text>
        </Button>
      </View>
    </Dialog>
  );
};

export interface MD3ConfirmDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: 'default' | 'destructive';
}

export const MD3ConfirmDialog: React.FC<MD3ConfirmDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.confirmDialog}>
      <View style={styles.confirmContent}>
        <Text variant="headlineSmall" style={[styles.confirmTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {message && <Text variant="bodyMedium" style={[styles.confirmMessage, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>}
      </View>
      <View style={styles.confirmActions}>
        <Button mode="text" onPress={onDismiss} style={styles.confirmAction}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{cancelText}</Text>
        </Button>
        <Button
          mode={variant === 'destructive' ? 'contained' : 'contained'}
          onPress={() => { onConfirm?.(); onDismiss(); }}
          style={styles.confirmAction}
        >
          <Text style={{ color: variant === 'destructive' ? theme.colors.onError : theme.colors.onPrimary }}>{confirmText}</Text>
        </Button>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  titleContainer: { flex: 1 },
  title: { fontWeight: '600' },
  subtitle: { marginTop: 2 },
  content: { marginTop: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  alertDialog: {
    margin: 24,
    borderRadius: 28,
  },
  alertContent: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  alertTitle: { fontWeight: '600', textAlign: 'center' },
  alertMessage: { textAlign: 'center', maxWidth: 280 },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  alertAction: { minWidth: 80 },
  confirmDialog: { margin: 24, borderRadius: 28 },
  confirmContent: { padding: 24, gap: 8 },
  confirmTitle: { fontWeight: '600' },
  confirmMessage: {},
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 16,
    paddingBottom: 16,
  },
  confirmAction: { minWidth: 80 },
});