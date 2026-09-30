import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { marginStart, pad, row } from '../lib/rtl';
import { useStore, useTasks } from '../state/store';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { Checkbox, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { ProjectRows } from '../components/ProjectRows';
import { Stamp } from '../components/Stamp';
import { StreakTallyIcon } from '../components/Icon';

export function TodayScreen({
  onStamp,
  onOpenProject,
}: {
  onStamp: () => void;
  onOpenProject: (projectId: string | null) => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { done } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const leftN = useTasks().filter((k) => k.list === 'today' && !done[k.id]).length;
  const allDone = leftN === 0;

  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: searchFieldInset }}
      >
        <PageHeader
          title={t.today}
          dateLine={t.dateLine}
          trailing={leftN ? `${leftN} ${t.left}` : t.allDoneShort}
          scrollY={scrollY}
        />

        <Ledger>
          <ProjectRows list="today" query={query} onOpen={onOpenProject} />

          {searching ? null : (
            <>
              <SectionLabel label={t.habits} />

              <View
                style={[
                  {
                    height: metrics.row,
                    flexDirection: row(rtl),
                    alignItems: 'center',
                    gap: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: c.rule,
                  },
                  pad(rtl, 16, metrics.gutter),
                ]}
              >
                <Checkbox circle color={c.moss} />
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.6}
                  style={[ui(17, 400, 22), { flex: 1, color: c.ink }, marginStart(rtl, 16)]}
                >
                  {t.habit1}
                </Text>
                <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
                  <StreakTallyIcon color={c.moss} flip={rtl} />
                  <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>12</Text>
                </View>
              </View>
            </>
          )}

          <EmptyRules count={4} />
        </Ledger>
      </Animated.ScrollView>

      <SearchField value={query} onChangeText={setQuery} />

      {allDone ? (
        <Pressable
          onPress={onStamp}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.pageClosed}
          style={{ position: 'absolute', top: 300, left: 0, right: 0, alignItems: 'center' }}
        >
          <Stamp label={t.pageClosed} />
        </Pressable>
      ) : null}
    </Screen>
  );
}
