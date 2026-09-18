import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { upcoming } from '../data/seed';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { Checkbox, Dot, EmptyRules, Ledger, LedgerRow } from '../components/Ledger';

export function UpcomingScreen() {
  const { c, t, ar, ui, mono, display, rtl } = useTheme();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const groups = upcoming(t, ar);

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <PageHeader title={t.upcoming} scrollY={scrollY} />

        <Ledger>
          {groups.map((g) => (
            <React.Fragment key={g.day}>
              <View
                style={[
                  {
                    height: metrics.row,
                    flexDirection: row(rtl),
                    alignItems: 'baseline',
                    gap: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: c.rule,
                  },
                  pad(rtl, metrics.content, metrics.gutter),
                ]}
              >
                <Text
                  maxFontSizeMultiplier={maxFontSizeMultiplier}
                  style={[display(20, { weight: 400, italic: true }), { color: c.ink }]}
                >
                  {g.day}
                </Text>
                <Text style={[mono(12, 500), { color: c.ink3 }]}>{g.date}</Text>
                <View style={{ flex: 1 }} />
                <Text style={[mono(12, 500), { color: c.ink3 }]}>{g.count}</Text>
              </View>

              {g.items.map((k) => (
                <LedgerRow key={k.title}>
                  <Checkbox />
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.6}
                    style={[
                      ui(17, 400, 22),
                      { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
                      marginStart(rtl, 16),
                    ]}
                  >
                    {k.title}
                  </Text>
                  <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
                    <Dot color={c[k.color]} />
                    {k.meta ? <Text style={[mono(12, 500), { color: c.ink3 }]}>{k.meta}</Text> : null}
                  </View>
                </LedgerRow>
              ))}
            </React.Fragment>
          ))}

          <EmptyRules count={2} />
        </Ledger>
      </Animated.ScrollView>
    </Screen>
  );
}
