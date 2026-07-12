import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable, View } from 'react-native';
import { List, Text, useTheme, Checkbox, RadioButton, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface MD3ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  leadingIcon?: string;
  trailingIcon?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  divider?: boolean;
  dividerIndent?: number;
  accessibilityLabel?: string;
}

export const MD3ListItem = React.forwardRef<any, MD3ListItemProps>(
  (
    {
      title,
      subtitle,
      description,
      leading,
      trailing,
      leadingIcon,
      trailingIcon = 'chevron-right',
      selected = false,
      disabled = false,
      onPress,
      onLongPress,
      style,
      titleStyle,
      descriptionStyle,
      divider = false,
      dividerIndent = 72,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const renderLeading = () => {
      if (leading) return leading;
      if (leadingIcon) {
        return (
          <View style={styles.leadingIconContainer}>
            <MaterialCommunityIcons name={leadingIcon as IconName} size={24} color={theme.colors.onSurfaceVariant} />
          </View>
        );
      }
      return null;
    };

    const renderTrailing = () => {
      if (trailing) return trailing;
      if (trailingIcon) {
        return (
          <View style={styles.trailingIconContainer}>
            <MaterialCommunityIcons name={trailingIcon as IconName} size={24} color={theme.colors.onSurfaceVariant} />
          </View>
        );
      }
      return null;
    };

    const renderTitle = () => {
      if (subtitle) {
        return (
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={[{ color: theme.colors.onSurface, fontWeight: '500' }, titleStyle]}>
              {title}
            </Text>
            <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          </View>
        );
      }
      return (
        <Text variant="titleMedium" style={[{ color: theme.colors.onSurface, fontWeight: '500' }, titleStyle]}>
          {title}
        </Text>
      );
    };

    const renderDescription = () => {
      if (!description) return null;
      return (
        <Text variant="bodySmall" style={[{ color: theme.colors.onSurfaceVariant, marginTop: 2 }, descriptionStyle]}>
          {description}
        </Text>
      );
    };

    const leadingNode = renderLeading();
    const trailingNode = renderTrailing();

    return (
      <List.Item
        ref={ref}
        title={renderTitle()}
        description={renderDescription()}
        left={leadingNode ? () => leadingNode : undefined}
        right={trailingNode ? () => trailingNode : undefined}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        style={[
          styles.item,
          {
            backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
            borderBottomWidth: divider ? 1 : 0,
            borderBottomColor: theme.colors.outlineVariant,
          },
          style,
        ]}
        titleStyle={styles.itemTitle}
        descriptionStyle={styles.itemDescription}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityState={{ selected, disabled }}
        {...(props as any)}
      />
    );
  }
);

MD3ListItem.displayName = 'MD3ListItem';

// Selectable List Item (with checkbox/radio/switch)
export interface MD3SelectableListItemProps extends Omit<MD3ListItemProps, 'trailing'> {
  selectable?: 'checkbox' | 'radio' | 'switch';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}

export const MD3SelectableListItem: React.FC<MD3SelectableListItemProps> = ({
  selectable = 'checkbox',
  value = false,
  onValueChange,
  leadingIcon,
  ...props
}) => {
  const theme = useTheme();

  const handlePress = () => {
    if (onValueChange) {
      onValueChange(!value);
    }
  };

  const renderTrailing = () => {
    if (selectable === 'checkbox') {
      return (
        <View style={styles.trailingSelectable}>
          <Checkbox
            status={value ? 'checked' : 'unchecked'}
            onPress={handlePress}
            disabled={props.disabled}
            color={theme.colors.primary}
          />
        </View>
      );
    }
    if (selectable === 'radio') {
      return (
        <View style={styles.trailingSelectable}>
          <RadioButton
            status={value ? 'checked' : 'unchecked'}
            onPress={handlePress}
            disabled={props.disabled}
            color={theme.colors.primary}
            value=""
          />
        </View>
      );
    }
    if (selectable === 'switch') {
      return (
        <View style={styles.trailingSelectable}>
          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={props.disabled}
            color={theme.colors.primary}
          />
        </View>
      );
    }
    return (props as any).trailing;
  };

  return (
    <MD3ListItem
      {...props}
      onPress={handlePress}
      leadingIcon={leadingIcon}
      trailing={renderTrailing()}
    />
  );
};

// List Section Header
export interface MD3ListSectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const MD3ListSectionHeader: React.FC<MD3ListSectionHeaderProps> = ({
  title,
  action,
  style,
  titleStyle,
}) => {
  const theme = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }, style]}>
      <Text variant="labelLarge" style={[{ color: theme.colors.onSurfaceVariant, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }, titleStyle]}>
        {title}
      </Text>
      {action}
    </View>
  );
};

// MD3 List wrapper
export const MD3List: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => {
  return <View style={[{ marginBottom: 8 }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  item: {
    minHeight: 56,
    paddingHorizontal: 16,
  },
  leadingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  trailingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  itemTitle: {
    fontWeight: '500',
  },
  itemDescription: {
    marginTop: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  trailingSelectable: {
    marginLeft: 8,
  },
});