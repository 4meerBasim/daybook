import React, { memo, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { Screen, useHeaderTop } from '../components/Screen';
import { CheckIcon } from '../components/Icon';

const Strip = memo(function Strip({
  filled,
  filledColor,
  emptyColor,
  reduced,
}: {
  filled: boolean;
  filledColor: string;
  emptyColor: string;
  reduced: boolean;
}) {
  const p = useSharedValue(filled ? 1 : 0);
  useEffect(() => {
    p.value = reduced ? (filled ? 1 : 0) : withTiming(filled ? 1 : 0, { duration: 600 });
  }, [filled, reduced, p]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [emptyColor, filledColor]),
  }));

  return <Animated.View style={[{ height: 1.5, borderRadius: 1 }, style]} />;
});

export function FocusScreen({ onClose }: { onClose: () => void }) {
  const { c, t, rtl, reduced, display, ui, mono } = useTheme();
  const [left, setLeft] = useState(1499);
  const [running, setRunning] = useState(true);
  const top = useHeaderTop();

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 1500)), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const toggleRun = () => setRunning((r) => !r);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const filled = 25 - Math.ceil(left / 60);
  const runLabel = running ? t.pause : t.resume;

  return (
    <Screen paper2>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: 24,
            flexDirection: row(rtl),
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>{t.focus}</Text>
          <Text style={[mono(12, 500, 0.1), { color: c.ink3, writingDirection: 'ltr' }]}>1 / 4</Text>
        </View>

        <Text
          maxFontSizeMultiplier={1.6}
          style={[
            display(34, { lineHeight: 40 }),
            { color: c.ink, paddingTop: 60, paddingHorizontal: 24, textAlign: align(rtl) },
          ]}
        >
          {t.task2}
        </Text>

        <Text
          style={[
            ui(15, 400),
            { color: c.ink2, paddingTop: 8, paddingHorizontal: 24, textAlign: align(rtl) },
          ]}
        >
          {t.work} · {t.sub2}
        </Text>

        <Text
          allowFontScaling={false}
          style={[
            mono(64, 500, -0.03),
            {
              color: c.ink,
              lineHeight: 64,
              paddingTop: 48,
              paddingHorizontal: 24,
              fontVariant: ['tabular-nums'],
              writingDirection: 'ltr',
              textAlign: align(rtl),
            },
          ]}
        >
          {mm}:{ss}
        </Text>

        <View style={{ marginTop: 28, marginHorizontal: 24, gap: 6 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <Strip
              key={i}
              filled={i < filled}
              filledColor={c.ink}
              emptyColor={c.rule}
              reduced={reduced}
            />
          ))}
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 56,
            left: 24,
            right: 24,
            flexDirection: row(rtl),
            gap: 10,
          }}
        >
          <Pressable
            onPress={toggleRun}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={runLabel}
            style={{
              flex: 1,
              height: metrics.pen,
              borderRadius: radius.card,
              backgroundColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[ui(17, 500), { color: c.paper }]}>{runLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.done}
            style={{
              width: metrics.pen,
              height: metrics.pen,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon width={14} height={12} color={c.ink} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
