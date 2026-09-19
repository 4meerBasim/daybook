import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { marginStart, row } from '../lib/rtl';
import { inbox } from '../data/seed';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { Checkbox, EmptyRules, Ledger, LedgerRow, SectionLabel } from '../components/Ledger';
import { Chip } from '../components/Chip';

export function InboxScreen() {
  const { c, t, ui, ar, rtl } = useTheme();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const rows = inbox(ar);

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <PageHeader title={t.inbox} trailing="3" scrollY={scrollY} />

        <Ledger>
          {rows.map((k) => (
            <LedgerRow key={k.title}>
              <Checkbox />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                maxFontSizeMultiplier={1.6}
                style={[ui(17, 400, 22), { flex: 1, minWidth: 0, color: c.ink }, marginStart(rtl, 16)]}
              >
                {k.title}
              </Text>
              <View style={{ flexDirection: row(rtl), gap: 6 }}>
                <Chip label={t.today} outline height={28} />
                <Chip label={t.someday} outline height={28} />
              </View>
            </LedgerRow>
          ))}

          <SectionLabel label={`${t.someday} · 4`} />

          <EmptyRules count={5} />
        </Ledger>
      </Animated.ScrollView>
    </Screen>
  );
}
