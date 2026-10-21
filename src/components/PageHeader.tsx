import React from 'react';
import { Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useHeaderTop } from './Screen';

export function PageHeader({
  title,
  dateLine,
  trailing,
  scrollY,
}: {
  title: string;
  dateLine?: string;
  trailing?: string;
  scrollY?: SharedValue<number>;
}) {
  const { c, display, mono, rtl, reduced } = useTheme();
  const top = useHeaderTop();

  const big = display(40);
  const baseSize = big.fontSize as number;
  const baseLineHeight = (big.lineHeight as number) ?? 44;

  const style = useAnimatedStyle(() => {
    if (!scrollY || reduced) return { fontSize: baseSize, lineHeight: baseLineHeight };
    const p = Math.min(Math.max(scrollY.value, 0) / 44, 1);
    const size = baseSize - p * (baseSize - 22);
    return { fontSize: size, lineHeight: size * 1.1 };
  });

  return (
    <View
      style={{
        paddingTop: top,
        paddingHorizontal: metrics.gutter,
        paddingBottom: 12,
        flexDirection: row(rtl),
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexShrink: 1 }}>
        {dateLine ? (
          <Text style={[display(15, { weight: 400, italic: true }), { color: c.ink2, textAlign: align(rtl) }]}>
            {dateLine}
          </Text>
        ) : null}
        <Animated.Text
          allowFontScaling
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[big, { color: c.ink, textAlign: align(rtl) }, style]}
        >
          {title}
        </Animated.Text>
      </View>
      {trailing ? (
        <Text style={[mono(13, 500), { color: c.ink3, paddingBottom: 6 }]}>{trailing}</Text>
      ) : null}
    </View>
  );
}
