import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme/colors';

interface StatCardProps {
  title: string;
  value: number;
  color?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function StatCard({ title, value, color, icon }: StatCardProps) {
  const theme = useTheme();
  const accentColor = color ?? theme.colors.primary;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.textContainer}>
            <Text variant="headlineLarge" style={[styles.value, { color: theme.colors.onSurface }]}>
              {value}
            </Text>
            <Text variant="labelMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {icon ? (
            <View style={[styles.iconBadge, { backgroundColor: accentColor + '18' }]}>
              <MaterialCommunityIcons name={icon} size={22} color={accentColor} />
            </View>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  content: {
    padding: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  value: {
    fontWeight: '800',
    fontSize: 26,
    lineHeight: 32,
  },
  title: {
    marginTop: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
