import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Card, CardProps, Text, useTheme } from 'react-native-paper';

export type MD3CardVariant = 'elevated' | 'filled' | 'outlined';

export interface MD3CardProps extends Omit<CardProps, 'mode' | 'style' | 'elevation'> {
  variant?: MD3CardVariant;
  padding?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

const variantModeMap: Record<MD3CardVariant, 'elevated' | 'outlined' | 'contained'> = {
  elevated: 'elevated',
  filled: 'contained',
  outlined: 'outlined',
};

export const MD3Card = React.forwardRef<any, MD3CardProps>(
  ({ variant = 'elevated', padding = 16, style, children, ...props }, ref) => {
    const theme = useTheme();

    const variantStyles = {
      elevated: {
        backgroundColor: theme.colors.surface,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      filled: {
        backgroundColor: theme.colors.surfaceVariant,
        elevation: 0,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      outlined: {
        backgroundColor: theme.colors.surface,
        elevation: 0,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      },
    };

    const vStyle = variantStyles[variant];

    return (
      <Card
        ref={ref}
        mode={variantModeMap[variant] as any}
        elevation={0}
        style={[
          {
            backgroundColor: vStyle.backgroundColor,
            borderWidth: vStyle.borderWidth,
            borderColor: vStyle.borderColor,
            borderRadius: 16,
            overflow: 'hidden',
          },
          style,
        ]}
        {...props}
      >
        <Card.Content style={{ padding }}>{children}</Card.Content>
      </Card>
    );
  }
);

MD3Card.displayName = 'MD3Card';

export interface MD3CardHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const MD3CardHeader: React.FC<MD3CardHeaderProps> = ({
  title,
  subtitle,
  avatar,
  action,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 }, style]}>
      {avatar && <View style={{ width: 40, height: 40, borderRadius: 20 }}>{avatar}</View>}
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
};

export interface MD3CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const MD3CardContent: React.FC<MD3CardContentProps> = ({ children, style }) => {
  return <View style={[{ paddingHorizontal: 16, paddingBottom: 16 }, style]}>{children}</View>;
};

export interface MD3CardActionsProps {
  children: React.ReactNode;
  style?: ViewStyle;
  align?: 'start' | 'end' | 'center';
}

export const MD3CardActions: React.FC<MD3CardActionsProps> = ({ children, style, align = 'end' }) => {
  const alignMap: Record<'start' | 'end' | 'center', ViewStyle['justifyContent']> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
  };

  return (
    <View
      style={[
        { flexDirection: 'row', gap: 8, padding: 16, justifyContent: alignMap[align] },
        style,
      ]}
    >
      {children}
    </View>
  );
};