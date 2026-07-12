import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, Animated, Easing, PanResponder, GestureResponderEvent, PanResponderGestureState, View, TouchableOpacity, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface MD3BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  handleIndicator?: boolean;
  maxHeight?: number | string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onDragEnd?: (height: number) => void;
}

export const MD3BottomSheet: React.FC<MD3BottomSheetProps> = ({
  visible,
  onDismiss,
  children,
  title,
  subtitle,
  handleIndicator = true,
  maxHeight = '85%',
  style,
  contentStyle,
  onDragEnd,
}) => {
  const theme = useTheme();

  const translateY = React.useRef(new Animated.Value(0)).current;
  const [sheetHeight, setSheetHeight] = React.useState(0);

  const animateIn = React.useCallback(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const animateOut = React.useCallback(() => {
    Animated.timing(translateY, {
      toValue: sheetHeight,
      duration: 250,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(onDismiss);
  }, [translateY, sheetHeight, onDismiss]);

  React.useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, animateIn, animateOut]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const dy = gestureState.dy;
        if (dy > 0) {
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const dy = gestureState.dy;
        const velocity = gestureState.vy;
        if (dy > 100 || velocity > 500) {
          onDismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 100, friction: 8 }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={onDismiss} style={styles.backdrop} activeOpacity={1} />
      <View style={[styles.sheet, { maxHeight: (maxHeight === '85%' ? '85%' : maxHeight) as any }, style]}>
        {handleIndicator && (
          <View style={styles.handleContainer}>
            <Animated.View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>
        )}
        {(title || subtitle) && (
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {title && <Text variant="titleLarge" style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>{title}</Text>}
              {subtitle && <Text variant="bodyMedium" style={[styles.sheetSubtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.content, contentStyle]} onLayout={(e: any) => setSheetHeight(e.nativeEvent.layout.height)}>
          {children}
        </View>
      </View>
    </Animated.View>
  );
};

export interface MD3ModalSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  style?: ViewStyle;
}

export const MD3ModalSheet: React.FC<MD3ModalSheetProps> = ({
  visible,
  onDismiss,
  title,
  children,
  actions,
  style,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.modalContainer, style]}>
      <TouchableOpacity onPress={onDismiss} style={styles.modalBackdrop} activeOpacity={1} />
      <Animated.View style={[styles.modalSheet, style]}>
        {title && (
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{title}</Text>
            <TouchableOpacity onPress={onDismiss}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.modalContent}>{children}</View>
        {actions && <View style={styles.modalActions}>{actions}</View>}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  titleContainer: { flex: 1 },
  sheetTitle: { fontWeight: '600' },
  sheetSubtitle: { marginTop: 2 },
  closeButton: { padding: 8 },
  content: { padding: 16, paddingBottom: 32 },

  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: { fontWeight: '600', flex: 1 },
  modalContent: { padding: 16, maxHeight: '70%' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
});