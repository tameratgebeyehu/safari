import React from 'react';
import { StyleSheet, TextStyle, View, StyleProp, ViewStyle } from 'react-native';
import { Chip, ChipProps, useTheme } from 'react-native-paper';

export type MD3ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion' | 'action';

export interface MD3ChipProps extends Omit<ChipProps, 'style' | 'textStyle' | 'icon' | 'onPress' | 'selected' | 'disabled' | 'onLongPress'> {
  variant?: MD3ChipVariant;
  label: string;
  leadingIcon?: string;
  trailingIcon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const MD3Chip = React.forwardRef<any, MD3ChipProps>(
  ({ variant = 'filter', label, leadingIcon, trailingIcon, selected = false, onPress, disabled = false, style, textStyle, ...props }, ref) => {
    const theme = useTheme();

    const variantStyles = {
      assist: {
        backgroundColor: selected ? theme.colors.tertiaryContainer : theme.colors.surfaceVariant,
        borderColor: theme.colors.outlineVariant,
        textColor: selected ? theme.colors.onTertiaryContainer : theme.colors.onSurfaceVariant,
      },
      filter: {
        backgroundColor: selected ? theme.colors.secondaryContainer : theme.colors.surfaceVariant,
        borderColor: theme.colors.outlineVariant,
        textColor: selected ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant,
      },
      input: {
        backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
        borderColor: theme.colors.outlineVariant,
        textColor: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
      },
      suggestion: {
        backgroundColor: selected ? theme.colors.tertiaryContainer : theme.colors.surfaceVariant,
        borderColor: theme.colors.outlineVariant,
        textColor: selected ? theme.colors.onTertiaryContainer : theme.colors.onSurfaceVariant,
      },
      action: {
        backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
        borderColor: theme.colors.outlineVariant,
        textColor: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
      },
    };

    const variantStyle = variantStyles[variant];
    const paperMode = variant === 'action' ? 'flat' : 'outlined';

    return (
      <Chip
        ref={ref}
        mode={paperMode}
        icon={leadingIcon}
        onPress={onPress}
        disabled={disabled}
        selected={selected}
        style={[
          {
            backgroundColor: variantStyle.backgroundColor,
            borderColor: variantStyle.borderColor,
            borderWidth: variant === 'action' ? 0 : 1,
            height: 32,
          },
          disabled && { opacity: 0.38 },
          style,
        ]}
        textStyle={[
          { color: variantStyle.textColor, fontWeight: '500', fontSize: 13 },
          textStyle,
        ]}
        {...(props as any)}
      >
        {label}
        {trailingIcon && <View style={styles.trailingIcon}>{trailingIcon}</View>}
      </Chip>
    );
  }
);

MD3Chip.displayName = 'MD3Chip';

export interface MD3ChipGroupProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  singleSelect?: boolean;
  onSelectionChange?: (selectedLabels: string[]) => void;
}

export const MD3ChipGroup: React.FC<MD3ChipGroupProps> = ({ children, style, singleSelect = false, onSelectionChange }) => {
  const [selectedLabels, setSelectedLabels] = React.useState<string[]>([]);

  const handleChipPress = (label: string) => {
    if (singleSelect) {
      const newSelection = selectedLabels.includes(label) ? [] : [label];
      setSelectedLabels(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      const newSelection = selectedLabels.includes(label)
        ? selectedLabels.filter((l) => l !== label)
        : [...selectedLabels, label];
      setSelectedLabels(newSelection);
      onSelectionChange?.(newSelection);
    }
  };

  return (
    <View style={[styles.group, style]}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          selected: selectedLabels.includes((child.props as any).label),
          onPress: () => handleChipPress((child.props as any).label),
        });
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trailingIcon: {
    marginLeft: 4,
  },
});