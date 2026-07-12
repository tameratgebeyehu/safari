export const colors = {
  // Brand colors
  primary: '#22C55E',
  primaryLight: '#86EFAC',
  primaryDark: '#166534',
  secondary: '#3B82F6',
  secondaryLight: '#BFDBFE',
  secondaryDark: '#1E3A5F',
  tertiary: '#EF4444',
  tertiaryLight: '#FEF2F2',
  tertiaryDark: '#7F1D1D',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  errorDark: '#7F1D1D',
  success: '#22C55E',
  warning: '#F59E0B',

  // Light theme
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F4F4F5',
  text: '#18181B',
  textSecondary: '#52525B',
  border: '#E4E4E7',
  borderLight: '#D4D4D8',

  // Dark theme
  darkBackground: '#09090B',
  darkSurface: '#18181B',
  darkSurfaceVariant: '#27272A',
  darkText: '#FAFAFA',
  darkTextSecondary: '#A1A1AA',
  darkBorder: '#3F3F46',
  darkBorderLight: '#52525B',

  // Status colors
  pending: '#F59E0B',
  processing: '#3B82F6',
  completed: '#22C55E',
  cancelled: '#EF4444',
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const typography = {
  fontSize: {
    displayLarge: 57,
    displayMedium: 45,
    displaySmall: 36,
    headlineLarge: 32,
    headlineMedium: 28,
    headlineSmall: 24,
    titleLarge: 22,
    titleMedium: 16,
    titleSmall: 14,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  lineHeight: {
    displayLarge: 64,
    displayMedium: 52,
    displaySmall: 44,
    headlineLarge: 40,
    headlineMedium: 36,
    headlineSmall: 32,
    titleLarge: 28,
    titleMedium: 24,
    titleSmall: 20,
    bodyLarge: 24,
    bodyMedium: 20,
    bodySmall: 16,
    labelLarge: 20,
    labelMedium: 16,
    labelSmall: 14,
  },
  letterSpacing: {
    displayLarge: -0.25,
    displayMedium: 0,
    displaySmall: 0,
    headlineLarge: 0,
    headlineMedium: 0,
    headlineSmall: 0,
    titleLarge: 0,
    titleMedium: 0.15,
    titleSmall: 0.1,
    bodyLarge: 0.5,
    bodyMedium: 0.25,
    bodySmall: 0.4,
    labelLarge: 0.1,
    labelMedium: 0.5,
    labelSmall: 0.5,
  },
};

export const statusColors = {
  pending: colors.pending,
  processing: colors.processing,
  completed: colors.completed,
  cancelled: colors.cancelled,
};