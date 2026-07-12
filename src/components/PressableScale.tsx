import React, { type ReactNode, useCallback, useRef } from 'react';
import { Animated, Pressable, type AccessibilityRole, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

interface PressableScaleProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export function PressableScale({ children, scaleTo = 0.97, style, onPressIn, onPressOut, accessibilityLabel, accessibilityHint, accessibilityRole, ...props }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (e: any) => {
      Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, tension: 200, friction: 15 }).start();
      onPressIn?.(e);
    },
    [scale, scaleTo, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 15 }).start();
      onPressOut?.(e);
    },
    [scale, onPressOut]
  );

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} accessibilityRole={accessibilityRole} {...props}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
