import React from 'react';
import { StyleSheet, ViewStyle, Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface MD3TabBarProps {
  variant?: 'primary' | 'secondary' | 'standard';
  showLabels?: boolean;
  activeIndicator?: 'pill' | 'underline' | 'none';
  children?: React.ReactNode;
}

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
  dashboard: { focused: 'view-dashboard', default: 'view-dashboard-outline' },
  requests: { focused: 'format-list-bulleted', default: 'format-list-bulleted-outline' },
  favorites: { focused: 'star', default: 'star-outline' },
  history: { focused: 'history', default: 'history-outline' },
  settings: { focused: 'cog', default: 'cog-outline' },
  send: { focused: 'send', default: 'send-outline' },
};

export const MD3TabBar: React.FC<any> = ({
  variant = 'primary',
  showLabels = true,
  activeIndicator = 'pill',
  style,
  ...props
}) => {
  const theme = useTheme();

  const getIndicatorStyle = () => {
    if (activeIndicator === 'none') return { display: 'none' };
    if (activeIndicator === 'underline') {
      return {
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.colors.primary,
      };
    }
    // pill indicator (default)
    return {
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primaryContainer,
    };
  };

  const indicatorStyle = getIndicatorStyle();

  return (
    <View style={style}>
      {props.children}
    </View>
  );
};

export const MD3TabScreen = ({
  name,
  title,
  iconName,
  badge,
  children,
  ...props
}: {
  name: string;
  title: string;
  iconName: keyof typeof TAB_ICONS;
  badge?: number;
  children: React.ReactNode;
  options?: any;
}) => {
  const icons = TAB_ICONS[iconName] || { focused: iconName, default: iconName + '-outline' };

  const ScreenComponent = Tabs.Screen as any;

  return (
    <ScreenComponent
      name={name}
      options={{
        title,
        tabBarBadge: badge && badge > 0 ? badge : undefined,
        tabBarBadgeStyle: styles.badge,
        tabBarIcon: ({ color, size, focused }: any) => (
          <MaterialCommunityIcons
            name={(focused ? icons.focused : icons.default) as any}
            size={size}
            color={color}
          />
        ),
        ...props,
      }}
    >
      {children}
    </ScreenComponent>
  );
};

// Sender Tab Bar (simplified - 2 tabs)
export const MD3SenderTabBar: React.FC<any> = (props) => {
  const theme = useTheme();

  return (
    <View style={styles.tabBar}>
      {props.children}
    </View>
  );
};

// Top App Bar (for screens that need it)
export interface MD3TopAppBarProps {
  title?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  centerTitle?: boolean;
  scrollBehavior?: 'collapse' | 'pinned' | 'hidden';
  style?: ViewStyle;
}

export const MD3TopAppBar: React.FC<MD3TopAppBarProps> = ({
  title,
  leading,
  trailing,
  centerTitle = true,
  scrollBehavior = 'pinned',
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[
      styles.topAppBar,
      {
        backgroundColor: theme.colors.surfaceVariant,
        borderBottomColor: theme.colors.outlineVariant,
        borderBottomWidth: 1,
        height: 56,
        paddingTop: 0,
      },
      style,
    ]}>
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.titleContainer}>
        {title && <Text variant="titleMedium" style={{ fontWeight: '700' }}>{title}</Text>}
      </View>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderRadius: 0,
    paddingTop: 8,
    minHeight: 60,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  topAppBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  leading: {
    minWidth: 48,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  trailing: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
  },
});