import React, { useState } from 'react';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { EmptyRules, Ledger } from '../components/Ledger';
import { ProjectRows } from '../components/ProjectRows';

export function UpcomingScreen({
  onOpenProject,
}: {
  onOpenProject: (projectId: string | null) => void;
}) {
  const { t } = useTheme();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const [query, setQuery] = useState('');

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: searchFieldInset }}
      >
        <PageHeader title={t.upcoming} scrollY={scrollY} />

        <Ledger>
          <ProjectRows list="upcoming" query={query} onOpen={onOpenProject} />
          <EmptyRules count={4} />
        </Ledger>
      </Animated.ScrollView>

      <SearchField value={query} onChangeText={setQuery} />
    </Screen>
  );
}
