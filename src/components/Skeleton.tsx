import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { spacing, borderRadius as br } from '../theme/colors';

function Shimmer({ style }: { style?: any }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { opacity, backgroundColor: theme.colors.surfaceVariant, borderRadius: br.sm },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardBody}>
          <Shimmer style={{ width: '70%', height: 16 }} />
          <Shimmer style={{ width: '50%', height: 12, marginTop: spacing.xs }} />
        </View>
        <Shimmer style={{ width: 64, height: 28 }} />
      </View>
      <Shimmer style={{ width: '30%', height: 20, marginTop: spacing.sm }} />
    </View>
  );
}

export function SkeletonStatCard() {
  return (
    <View style={styles.statCard}>
      <Shimmer style={{ width: 32, height: 32, borderRadius: br.full }} />
      <Shimmer style={{ width: '60%', height: 28, marginTop: spacing.sm }} />
      <Shimmer style={{ width: '40%', height: 12, marginTop: spacing.xs }} />
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </View>
      <Shimmer style={{ width: '40%', height: 20, marginTop: spacing.sm }} />
      <SkeletonList count={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: br.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBody: { flex: 1, marginRight: spacing.sm },
  statCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: br.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
});
