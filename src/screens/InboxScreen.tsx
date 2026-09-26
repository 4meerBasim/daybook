import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { rowTitle, type TaskRow } from '../db/schema';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { Checkbox, EmptyRules, Ledger, SectionLabel, rowContent, useRuling } from '../components/Ledger';
import { Chip } from '../components/Chip';
import { ProjectPickerSheet } from './ProjectPickerSheet';

export function InboxScreen() {
  const { t } = useTheme();
  const { inbox } = useStore();
  const [picking, setPicking] = useState<TaskRow | null>(null);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <PageHeader title={t.inbox} trailing={String(inbox.length)} scrollY={scrollY} />

        <Ledger>
          {inbox.map((k) => (
            <InboxRow key={k.id} task={k} onAssign={() => setPicking(k)} />
          ))}

          <SectionLabel label={`${t.someday} · 4`} />

          <EmptyRules count={5} />
        </Ledger>
      </Animated.ScrollView>

      {picking ? (
        <ProjectPickerSheet task={picking} onClose={() => setPicking(null)} />
      ) : null}
    </Screen>
  );
}

function InboxRow({ task, onAssign }: { task: TaskRow; onAssign: () => void }) {
  const { c, t, ui, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();

  return (
    <Pressable
      onLongPress={onAssign}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={rowTitle(task, t)}
      accessibilityHint={t.moveToProject}
      accessibilityActions={[{ name: 'assign', label: t.moveToProject }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'assign') onAssign();
      }}
      style={({ pressed }) => ({
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
        backgroundColor: pressed ? c.paper2 : 'transparent',
      })}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <Checkbox />
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            ui(17, 400, 22),
            { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
            marginStart(rtl, 16),
          ]}
        >
          {rowTitle(task, t)}
        </Text>
        <View style={{ flexDirection: row(rtl), gap: 6 }}>
          <Chip label={t.today} outline height={28} />
          <Chip label={t.someday} outline height={28} />
        </View>
      </View>
    </Pressable>
  );
}
