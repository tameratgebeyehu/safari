import React from 'react';
import { ViewStyle, TextStyle, TouchableOpacityProps, TouchableOpacity } from 'react-native';
import { Button, ButtonProps, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type MD3ButtonVariant =
  | 'filled'
  | 'filled-tonal'
  | 'outlined'
  | 'text'
  | 'icon'
  | 'extended-fab'
  | 'fab';

export interface MD3ButtonProps
  extends Omit<ButtonProps, 'mode' | 'style' | 'contentStyle' | 'labelStyle'> {
  variant?: MD3ButtonVariant;
  leadingIcon?: string;
  trailingIcon?: string;
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  labelStyle?: TextStyle;
  onPress?: () => void;
}

export const MD3Button = React.forwardRef(
  (
    {
      variant = 'filled',
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      loading = false,
      children,
      style: styleProp,
      contentStyle: contentStyleProp,
      labelStyle: labelStyleProp,
      onPress,
      disabled,
      ...props
    }: MD3ButtonProps,
    ref: React.Ref<any>
  ) => {
    const theme = useTheme();

    const modeMap: Record<MD3ButtonVariant, 'contained' | 'outlined' | 'text'> = {
      filled: 'contained',
      'filled-tonal': 'contained',
      outlined: 'outlined',
      text: 'text',
      icon: 'text',
      'extended-fab': 'contained',
      fab: 'contained',
    };

    const variantStyles: Record<
      MD3ButtonVariant,
      { backgroundColor: string; textColor: string; borderColor: string }
    > = {
      filled: {
        backgroundColor: theme.colors.primary,
        textColor: theme.colors.onPrimary,
        borderColor: 'transparent',
      },
      'filled-tonal': {
        backgroundColor: theme.colors.secondaryContainer,
        textColor: theme.colors.onSecondaryContainer,
        borderColor: 'transparent',
      },
      outlined: {
        backgroundColor: 'transparent',
        textColor: theme.colors.primary,
        borderColor: theme.colors.outline,
      },
      text: {
        backgroundColor: 'transparent',
        textColor: theme.colors.primary,
        borderColor: 'transparent',
      },
      icon: {
        backgroundColor: 'transparent',
        textColor: theme.colors.primary,
        borderColor: 'transparent',
      },
      'extended-fab': {
        backgroundColor: theme.colors.primaryContainer,
        textColor: theme.colors.onPrimaryContainer,
        borderColor: 'transparent',
      },
      fab: {
        backgroundColor: theme.colors.primaryContainer,
        textColor: theme.colors.onPrimaryContainer,
        borderColor: 'transparent',
      },
    };

    const vStyle = variantStyles[variant];
    const isFAB = variant === 'fab' || variant === 'extended-fab';

    const computedButtonStyle: ViewStyle = {
      backgroundColor: vStyle.backgroundColor,
      borderWidth: vStyle.borderColor === 'transparent' ? 0 : 1,
      borderColor: vStyle.borderColor,
      borderRadius: isFAB ? 24 : 12,
      ...(isFAB
        ? { paddingHorizontal: 24, paddingVertical: 12, elevation: 3 }
        : { paddingHorizontal: 20, paddingVertical: 10, minHeight: 48 }),
      ...(fullWidth ? { width: '100%' } : {}),
      ...styleProp,
    };

    const computedContentStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...contentStyleProp,
    };

    const computedLabelStyle: TextStyle = {
      color: vStyle.textColor,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'none',
      ...labelStyleProp,
    };

    const isDisabled = disabled || loading;

    const renderIcon = (name: string) => (
      <MaterialCommunityIcons name={name as IconName} size={isFAB ? 20 : 18} color={vStyle.textColor} />
    );

    return (
      <Button
        ref={ref}
        mode={modeMap[variant]}
        onPress={onPress}
        disabled={isDisabled}
        loading={loading}
        style={computedButtonStyle}
        contentStyle={computedContentStyle}
        labelStyle={computedLabelStyle}
        uppercase={false}
        {...props}
      >
        {leadingIcon && !isFAB && renderIcon(leadingIcon)}
        {children ?? (isFAB && leadingIcon ? renderIcon(leadingIcon) : null)}
        {trailingIcon && !isFAB && renderIcon(trailingIcon)}
      </Button>
    );
  }
);

MD3Button.displayName = 'MD3Button';

// ─── Icon Button ─────────────────────────────────────────────────────────────

export interface MD3IconButtonProps extends TouchableOpacityProps {
  icon: string;
  size?: number;
  color?: string;
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
  accessibilityLabel?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MD3IconButton: React.FC<MD3IconButtonProps> = ({
  icon,
  size = 24,
  color,
  variant = 'standard',
  accessibilityLabel,
  onPress,
  style,
  ...props
}) => {
  const theme = useTheme();

  const variantStyles = {
    standard: { backgroundColor: 'transparent', borderWidth: 0 },
    filled: { backgroundColor: theme.colors.primaryContainer, borderWidth: 0 },
    tonal: { backgroundColor: theme.colors.secondaryContainer, borderWidth: 0 },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
  };

  const vStyle = variantStyles[variant];
  const iconColor =
    color ||
    (variant === 'standard' ? theme.colors.onSurfaceVariant : theme.colors.primary);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          ...vStyle,
        },
        style,
      ]}
      {...props}
    >
      <MaterialCommunityIcons name={icon as IconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

// ─── FAB ─────────────────────────────────────────────────────────────────────

export interface MD3FABProps {
  icon: string;
  label?: string;
  onPress?: () => void;
  variant?: 'standard' | 'extended' | 'small';
  disabled?: boolean;
  style?: ViewStyle;
}

export const MD3FAB: React.FC<MD3FABProps> = ({
  icon,
  label,
  onPress,
  variant = 'standard',
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  const variantConfig = {
    standard: { size: 56, iconSize: 24, padding: 0, borderRadius: 28, fontSize: 0 },
    extended: {
      size: 56,
      iconSize: 20,
      padding: 24,
      borderRadius: 28,
      fontSize: 14,
      fontWeight: '600' as const,
    },
    small: { size: 40, iconSize: 18, padding: 0, borderRadius: 20, fontSize: 0 },
  };

  const config = variantConfig[variant];
  const isExtended = variant === 'extended';
  const iconColor = theme.colors.onPrimaryContainer;

  const computedStyle: ViewStyle = {
    width: isExtended ? undefined : config.size,
    height: config.size,
    minWidth: config.size,
    borderRadius: config.borderRadius,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: config.padding,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    opacity: disabled ? 0.38 : 1,
  };

  const computedLabelStyle: TextStyle = {
    color: theme.colors.onPrimaryContainer,
    fontSize: config.fontSize,
    fontWeight: '600',
  };

  if (isExtended) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[computedStyle, style]}
        accessibilityLabel={label || 'Floating action button'}
      >
        <MaterialCommunityIcons name={icon as IconName} size={config.iconSize} color={iconColor} />
        <Text style={computedLabelStyle}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[computedStyle, style]}
      accessibilityLabel={label || 'Floating action button'}
    >
      <MaterialCommunityIcons name={icon as IconName} size={config.iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};