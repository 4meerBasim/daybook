import React, { useState } from 'react';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks } from '../state/store';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { ProjectRows } from '../components/ProjectRows';

export function InboxScreen({
  onOpenProject,
  onAddProject,
}: {
  onOpenProject: (projectId: string | null) => void;
  onAddProject: () => void;
}) {
  const { t } = useTheme();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const [query, setQuery] = useState('');
  const count = useTasks().filter((k) => k.list === 'inbox').length;

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: searchFieldInset }}
      >
        <PageHeader title={t.inbox} trailing={String(count)} scrollY={scrollY} />

        <Ledger>
          <ProjectRows list="inbox" query={query} onOpen={onOpenProject} onAdd={onAddProject} />

          {query.trim() ? null : <SectionLabel label={`${t.someday} · 4`} />}

          <EmptyRules count={5} />
        </Ledger>
      </Animated.ScrollView>

      <SearchField value={query} onChangeText={setQuery} />
    </Screen>
  );
}
