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
import { mixInk } from '../theme/palette';
import { duration, easing, maxFontSizeMultiplier } from '../theme/tokens';
import { insetStart, marginStart, row } from '../lib/rtl';
import { Checkbox, Dot, rowContent, useRuling } from './Ledger';

export type TaskRowProps = {
  title: string;
  meta?: string;
  dotColor?: string;
  done?: boolean;
  carryCount?: number;
  decay?: number;
  overdue?: boolean;
  rule?: boolean;
  actions?: React.ReactNode;
  onToggle: () => void;
  accessibilityActions?: AccessibilityActionInfo[];
  onAccessibilityAction?: (e: AccessibilityActionEvent) => void;
};

export function TaskRow({
  title,
  meta,
  dotColor,
  done = false,
  carryCount = 0,
  decay = 0,
  overdue = false,
  rule = false,
  actions,
  onToggle,
  accessibilityActions,
  onAccessibilityAction,
}: TaskRowProps) {
  const { c, ui, mono, rtl, reduced } = useTheme();
  const { height, grown, onContentLayout } = useRuling();
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
    width: strike.value * (textWidth + 4),
  }));

  // ink2 rather than ink3 as the floor: 6.9:1 on light paper, 8.6:1 on dark, both clear of AA
  const aged = mixInk(c.ink, c.ink2, decay);
  const textColor = useDerivedValue(() =>
    interpolateColor(dry.value, [0, 1], [aged, c.ink3])
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
      accessibilityLabel={title}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={({ pressed }) => ({
        height,
        justifyContent: 'center',
        backgroundColor: pressed ? c.paper2 : done ? c.paper : 'transparent',
        borderBottomWidth: rule ? 1 : 0,
        borderBottomColor: c.rule,
      })}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <Checkbox checked={done} />

        <View
          style={[
            { flex: 1, minWidth: 0, flexDirection: row(rtl) },
            marginStart(rtl, 16),
          ]}
        >
          <View style={{ minWidth: 0, flexShrink: 1, position: 'relative' }}>
            <Animated.Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              onLayout={onLayout}
              style={[
                ui(17, 400, 22),
                titleStyle,
                grown && done ? { textDecorationLine: 'line-through' } : null,
              ]}
            >
              {title}
            </Animated.Text>
            {grown ? null : (
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: 'absolute',
                    top: '50%',
                    height: 1.5,
                    backgroundColor: c.ink,
                    ...insetStart(rtl, -2),
                  },
                  strikeStyle,
                ]}
              />
            )}
          </View>
        </View>

        {actions}

        {meta || dotColor || carryCount ? (
          <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
            {carryCount && !done ? (
              <Text style={[mono(11, 500, 0.1), { color: c.ink2 }]}>{carryCount}×</Text>
            ) : null}
            {dotColor ? <Dot color={dotColor} /> : null}
            {meta ? (
              <Text numberOfLines={1} style={[mono(12, 500), { color: overdue && !done ? c.ver : c.ink3 }]}>
                {meta}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
