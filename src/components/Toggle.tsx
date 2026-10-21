import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing } from '../theme/tokens';

export function Toggle({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  accessibilityLabel?: string;
}) {
  const { c, reduced, rtl } = useTheme();
  const p = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    const target = value ? 1 : 0;
    p.value = reduced ? target : withTiming(target, { duration: duration.ui, easing: easing.standard });
  }, [value, reduced]);

  const knob = useAnimatedStyle(() => {
    const x = 3 + p.value * 18;
    return { transform: [{ translateX: rtl ? -x : x }] };
  });

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 9, bottom: 9, left: 9, right: 9 }}
      android_ripple={null}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: c.ink,
        backgroundColor: value ? c.ink : 'transparent',
        justifyContent: 'center',
        alignItems: rtl ? 'flex-end' : 'flex-start',
      }}
    >
      <Animated.View
        style={[
          {
            width: 17,
            height: 17,
            borderRadius: 9,
            backgroundColor: value ? c.paper : c.ink,
          },
          knob,
        ]}
      />
    </Pressable>
  );
}
