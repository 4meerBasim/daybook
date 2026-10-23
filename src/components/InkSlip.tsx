import React, { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing, metrics, radius } from '../theme/tokens';
import { pad, row } from '../lib/rtl';
import type { Strings } from '../i18n/strings';
import { useStore, type Reversal } from '../state/store';

const LINGER = 5000;

function slipLabel(kind: Reversal['kind'], t: Strings): string {
  switch (kind) {
    case 'struck':
      return t.slipStruck;
    case 'deleted':
      return t.slipDeleted;
    case 'snoozed':
      return t.slipSnoozed;
    case 'rescheduled':
      return t.slipRescheduled;
  }
}

export function InkSlip({ bottom }: { bottom: number }) {
  const { c, t, ui, mono, rtl, reduced } = useTheme();
  const { reversal, lift, clearReversal } = useStore();
  const seq = reversal ? reversal.seq : 0;
  const enter = useSharedValue(0);

  useEffect(() => {
    if (!seq) return;
    enter.value = reduced ? 1 : withTiming(1, { duration: duration.ui, easing: easing.standard });
    const timer = setTimeout(() => clearReversal(seq), LINGER);
    return () => clearTimeout(timer);
  }, [seq, reduced]);

  useEffect(() => {
    if (!reversal) enter.value = 0;
  }, [reversal]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  if (!reversal) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom,
          left: metrics.gutter,
          right: metrics.gutter,
          minHeight: metrics.minTap,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: metrics.gap,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.rule,
          borderRadius: radius.card,
        },
        pad(rtl, metrics.gutter, 6),
        style,
      ]}
    >
      <Text numberOfLines={1} style={[mono(12, 500, 0.1), { flex: 1, color: c.ink2 }]}>
        {slipLabel(reversal.kind, t)}
      </Text>
      <Pressable
        onPress={lift}
        android_ripple={null}
        accessibilityRole="button"
        accessibilityLabel={t.liftTheInk}
        style={({ pressed }) => ({
          minHeight: metrics.minTap,
          paddingHorizontal: metrics.gap,
          justifyContent: 'center',
          borderRadius: radius.chip,
          backgroundColor: pressed ? c.paper2 : 'transparent',
        })}
      >
        <Text style={[ui(15, 500), { lineHeight: undefined, color: c.ink }]}>{t.liftTheInk}</Text>
      </Pressable>
    </Animated.View>
  );
}
