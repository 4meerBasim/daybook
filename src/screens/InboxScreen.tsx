import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { marginStart, row } from '../lib/rtl';
import { matches } from '../lib/matches';
import { inbox } from '../data/seed';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField } from '../components/SearchField';
import { Checkbox, EmptyRules, Ledger, LedgerRow, SectionLabel } from '../components/Ledger';
import { Chip } from '../components/Chip';

export function InboxScreen() {
  const { c, t, ui, ar, rtl } = useTheme();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const rows = inbox(ar).filter((k) => matches(k.title, query));

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <PageHeader title={t.inbox} trailing={String(rows.length)} scrollY={scrollY} />
        <SearchField value={query} onChangeText={setQuery} />

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

          {rows.length === 0 ? <SectionLabel label={t.noMatches} /> : null}

          {searching ? null : <SectionLabel label={`${t.someday} · 4`} />}

          <EmptyRules count={5} />
        </Ledger>
      </Animated.ScrollView>
    </Screen>
  );
}
