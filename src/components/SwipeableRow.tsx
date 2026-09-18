import React, { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing, metrics } from '../theme/tokens';
import { row } from '../lib/rtl';
import { CheckIcon } from './Icon';

const DONE = 0.4;
const SNOOZE = 0.3;
const PICK = 0.55;
const DELETE = 0.7;

export function SwipeableRow({
  children,
  onComplete,
  onSnooze,
  onPickDate,
  onDelete,
  onLongPress,
}: {
  children: React.ReactNode;
  onComplete: () => void;
  onSnooze: () => void;
  onPickDate: () => void;
  onDelete: () => void;
  onLongPress: () => void;
}) {
  const { c, t, ui, rtl, reduced } = useTheme();
  const [width, setWidth] = useState(0);

  const sign = rtl ? -1 : 1;
  const tx = useSharedValue(0);
  const lifted = useSharedValue(0);

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  const settle = (to: number) => {
    'worklet';
    tx.value = reduced ? to : withTiming(to, { duration: duration.ui, easing: easing.standard });
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      tx.value = e.translationX;
    })
    .onEnd((_e, success) => {
      if (!success || !width) {
        settle(0);
        return;
      }
      const p = (tx.value * sign) / width;
      if (p >= DONE) {
        runOnJS(tap)();
        runOnJS(onComplete)();
      } else if (-p >= DELETE) {
        runOnJS(tap)();
        runOnJS(onDelete)();
      } else if (-p >= PICK) {
        runOnJS(tap)();
        runOnJS(onPickDate)();
      } else if (-p >= SNOOZE) {
        runOnJS(tap)();
        runOnJS(onSnooze)();
      }
      settle(0);
    });

  const hold = Gesture.LongPress()
    .minDuration(320)
    .onStart(() => {
      lifted.value = 1;
      runOnJS(tap)();
      runOnJS(onLongPress)();
    })
    .onFinalize(() => {
      lifted.value = 0;
    });

  const gesture = Gesture.Race(pan, hold);

  const face = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    backgroundColor: lifted.value ? c.paper2 : tx.value === 0 ? 'transparent' : c.paper,
  }));

  const leading = useAnimatedStyle(() => ({ opacity: tx.value * sign > 0 ? 1 : 0 }));
  const trailing = useAnimatedStyle(() => {
    const p = width ? (-tx.value * sign) / width : 0;
    return { opacity: p > 0 && p < DELETE ? 1 : 0 };
  });
  const destructive = useAnimatedStyle(() => {
    const p = width ? (-tx.value * sign) / width : 0;
    return { opacity: p >= DELETE ? 1 : 0 };
  });

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const fill = { position: 'absolute' as const, top: 0, bottom: 0, left: 0, right: 0 };
  const actionText = [ui(13, 500), { lineHeight: undefined }];

  return (
    <View
      onLayout={onLayout}
      style={{
        position: 'relative',
        height: metrics.row,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          fill,
          {
            backgroundColor: c.mossS,
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: metrics.gutter,
          },
          leading,
        ]}
      >
        <CheckIcon width={14} height={12} color={c.moss} />
        <Text style={[actionText, { color: c.moss }]}>{t.done}</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          fill,
          {
            backgroundColor: c.blueS,
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 16,
            paddingHorizontal: metrics.gutter,
          },
          trailing,
        ]}
      >
        <Text style={[actionText, { color: c.blue }]}>{t.tomorrow}</Text>
        <Text style={[actionText, { color: c.blue }]}>{t.pickDate}</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          fill,
          {
            backgroundColor: c.verS,
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: metrics.gutter,
          },
          destructive,
        ]}
      >
        <Text style={[actionText, { color: c.ver }]}>{t.delete}</Text>
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[fill, face]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
