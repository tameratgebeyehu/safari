import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, TouchableOpacity, View, StyleProp } from 'react-native';
import { TextInput, TextInputProps, useTheme, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface MD3TextFieldProps extends Omit<TextInputProps, 'style' | 'contentStyle' | 'labelStyle' | 'right' | 'left' | 'error'> {
  variant?: 'filled' | 'outlined';
  label: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: string | React.ReactNode;
  trailingIcon?: string | React.ReactNode;
  trailingIconPress?: () => void;
  style?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const MD3TextField = React.forwardRef<any, MD3TextFieldProps>(
  ({ variant = 'outlined', label, placeholder, error, helperText, leadingIcon, trailingIcon, trailingIconPress, style, contentStyle, labelStyle, inputStyle, ...props }, ref) => {
    const theme = useTheme();
    const hasError = !!error;

    const leading = leadingIcon ? (
      typeof leadingIcon === 'string' ? (
        <TextInput.Icon
          icon={() => (
            <MaterialCommunityIcons
              name={leadingIcon as IconName}
              size={20}
              color={hasError ? theme.colors.error : theme.colors.onSurfaceVariant}
            />
          )}
        />
      ) : (
        leadingIcon
      )
    ) : undefined;

    const trailing = trailingIcon ? (
      typeof trailingIcon === 'string' ? (
        <TextInput.Icon
          icon={() => (
            <TouchableOpacity onPress={trailingIconPress} style={styles.trailingIcon}>
              <MaterialCommunityIcons name={trailingIcon as IconName} size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        />
      ) : (
        trailingIcon
      )
    ) : undefined;

    const paperMode = variant === 'filled' ? 'flat' : 'outlined';

    return (
      <View style={{ marginBottom: 8 }}>
        <TextInput
          ref={ref}
          mode={paperMode}
          label={label}
          placeholder={placeholder}
          error={hasError}
          right={trailing}
          left={leading}
          style={[style]}
          contentStyle={contentStyle}
          selectionColor={theme.colors.primary}
          activeUnderlineColor={hasError ? theme.colors.error : theme.colors.primary}
          underlineColor={hasError ? theme.colors.error : theme.colors.outline}
          {...props}
        />
        {(hasError || helperText) && (
          <HelperText type={hasError ? 'error' : 'info'} visible={hasError || !!helperText}>
            {error || helperText}
          </HelperText>
        )}
      </View>
    );
  }
);

MD3TextField.displayName = 'MD3TextField';

// Search Bar Component
export interface MD3SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilter?: () => void;
  leadingIcon?: string;
  trailingIcon?: string;
  style?: ViewStyle;
  showFilter?: boolean;
}

export const MD3SearchBar: React.FC<MD3SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  onClear,
  onFilter,
  leadingIcon = 'magnify',
  trailingIcon = 'filter-variant',
  style,
  showFilter = true,
}) => {
  const theme = useTheme();

  return (
    <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          left={
            <TextInput.Icon
              icon={() => (
                <MaterialCommunityIcons name={leadingIcon as IconName} size={20} color={theme.colors.onSurfaceVariant} />
              )}
            />
          }
          right={
            value.length > 0 ? (
              <TextInput.Icon
                icon={() => (
                  <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              />
            ) : showFilter && onFilter ? (
              <TextInput.Icon
                icon={() => (
                  <TouchableOpacity onPress={onFilter} style={styles.filterButton}>
                    <MaterialCommunityIcons name={trailingIcon as IconName} size={20} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              />
            ) : undefined
          }
          style={styles.textInput}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  textInput: {
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 4,
  },
  trailingIcon: {
    padding: 4,
  },
});

export { MD3TextField as TextField, MD3SearchBar as SearchBar };