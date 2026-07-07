import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors, typography } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.primaryLight,
    secondary: colors.primaryDark,
    error: colors.accent,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    outline: colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    onPrimary: '#000000',
    primaryContainer: colors.primaryDark,
    secondary: colors.primary,
    error: colors.accent,
    background: colors.darkBackground,
    surface: colors.darkSurface,
    onSurface: colors.darkText,
    outline: '#333333',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

export { colors, typography, spacing, borderRadius } from './colors';
