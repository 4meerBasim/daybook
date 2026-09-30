import React, { useEffect, useState } from 'react';
import {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing, metrics } from '../theme/tokens';
import { insetStart, marginStart, pad, row } from '../lib/rtl';
import { Checkbox, Dot } from './Ledger';

export type TaskRowProps = {
  title: string;
  meta?: string;
  dotColor?: string;
  done?: boolean;
  overdue?: boolean;
  onToggle: () => void;
  accessibilityActions: AccessibilityActionInfo[];
  onAccessibilityAction: (e: AccessibilityActionEvent) => void;
};

export function TaskRow({
  title,
  meta,
  dotColor,
  done = false,
  overdue = false,
  onToggle,
  accessibilityActions,
  onAccessibilityAction,
}: TaskRowProps) {
  const { c, ui, mono, rtl, reduced } = useTheme();
  const [textWidth, setTextWidth] = useState(0);

  const strike = useSharedValue(done ? 1 : 0);
  const dry = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    const target = done ? 1 : 0;
    if (reduced) {
      strike.value = target;
      dry.value = target;
      return;
    }
    strike.value = withTiming(target, {
      duration: done ? duration.stroke : 240,
      easing: easing.ink,
    });
    dry.value = withTiming(target, { duration: duration.dry, easing: easing.standard });
  }, [done, reduced]);

  const strikeStyle = useAnimatedStyle(() => ({
    width: strike.value * (textWidth + 2),
  }));

  const textColor = useDerivedValue(() =>
    interpolateColor(dry.value, [0, 1], [c.ink, c.ink3])
  );
  const titleStyle = useAnimatedStyle(() => ({ color: textColor.value }));

  const onLayout = (e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width);

  const handlePress = () => {
    if (!done) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={null}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={meta ? `${title}, ${meta}` : title}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={({ pressed }) => [
        {
          flex: 1,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 14,
          backgroundColor: pressed ? c.paper2 : done ? c.paper : 'transparent',
        },
        pad(rtl, 16, metrics.gutter),
      ]}
    >
      <Checkbox checked={done} />

      <View style={[{ flex: 1, minWidth: 0, position: 'relative' }, marginStart(rtl, 16)]}>
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={1.6}
          onLayout={onLayout}
          style={[ui(17, 400, 22), titleStyle]}
        >
          {title}
        </Animated.Text>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 11,
              height: 1.5,
              backgroundColor: c.ink,
              ...insetStart(rtl, -2),
            },
            strikeStyle,
          ]}
        />
      </View>

      {meta || dotColor ? (
        <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
          {dotColor ? <Dot color={dotColor} /> : null}
          {meta ? (
            <Text style={[mono(12, 500), { color: overdue && !done ? c.ver : c.ink3 }]}>{meta}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
