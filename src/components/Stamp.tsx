import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing } from '../theme/tokens';

export function Stamp({
  label,
  timestamp,
  size = 22,
  animate = true,
}: {
  label: string;
  timestamp?: string;
  size?: number;
  animate?: boolean;
}) {
  const { c, mono, reduced } = useTheme();
  const progress = useSharedValue(reduced || !animate ? 1 : 0);

  useEffect(() => {
    if (reduced || !animate) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: duration.page, easing: easing.standard });
  }, [animate, reduced]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const scale = reduced || !animate ? 1 : p < 0.6 ? 1.18 - (p / 0.6) * 0.21 : 0.97 + ((p - 0.6) / 0.4) * 0.03;
    const opacity = reduced || !animate ? 0.9 : Math.min(p / 0.6, 1) * 0.9;
    return { opacity, transform: [{ rotate: '-7deg' }, { scale }] };
  });

  const pad = size >= 26 ? { paddingVertical: 10, paddingHorizontal: 22 } : { paddingVertical: 8, paddingHorizontal: 18 };

  return (
    <Animated.View
      style={[
        {
          borderWidth: 3,
          borderColor: c.ver,
          borderRadius: 8,
          alignItems: 'center',
          ...pad,
        },
        style,
      ]}
    >
      <Text style={[mono(size, 500, 0.14), { color: c.ver, textTransform: 'uppercase' }]}>{label}</Text>
      {timestamp ? (
        <View style={{ marginTop: 2 }}>
          <Text style={[mono(11, 500, 0.1), { color: c.ver }]}>{timestamp}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
