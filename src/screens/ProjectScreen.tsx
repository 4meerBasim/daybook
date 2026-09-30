import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { useStore, useTasks } from '../state/store';
import { projects } from '../data/seed';
import type { RootParams } from '../navigation/Root';
import { Screen, useHeaderTop } from '../components/Screen';
import { Dot, EmptyRules, Ledger } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { ChevronBackIcon } from '../components/Icon';

export function ProjectScreen({ route, navigation }: NativeStackScreenProps<RootParams, 'Project'>) {
  const { projectId, list } = route.params;
  const { c, t, display, mono, rtl } = useTheme();
  const { done, toggle, clear } = useStore();
  const top = useHeaderTop();

  const project = projects(t).find((p) => p.id === projectId);
  const rows = useTasks().filter((k) => k.projectId === projectId && (!list || k.list === list));
  const doneN = rows.filter((k) => done[k.id]).length;

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'snooze', label: t.tomorrow },
    { name: 'pickDate', label: t.pickDate },
    { name: 'delete', label: t.delete },
  ];
  const onPickDate = () => navigation.navigate('Calendar');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.gutter }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12, gap: 8 }}>
          <View style={{ flexDirection: row(rtl) }}>
            <Pressable
              onPress={() => navigation.goBack()}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.back}
              style={[
                { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
                marginStart(rtl, -10),
              ]}
            >
              <ChevronBackIcon color={c.ink} flip={rtl} />
            </Pressable>
          </View>

          <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
            <Dot color={project ? c[project.color] : c.ink3} size={8} />
            <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>
              {list ? `${t.project} · ${t[list].toUpperCase()}` : t.project}
            </Text>
          </View>

          <View
            style={{
              flexDirection: row(rtl),
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                display(40, { lineHeight: 44 }),
                { flexShrink: 1, color: c.ink, textAlign: align(rtl) },
              ]}
            >
              {project ? project.name : t.noProject}
            </Text>
            <Text
              accessibilityLabel={`${doneN} ${t.of} ${rows.length}`}
              style={[mono(22, 500), { color: c.ink2, paddingBottom: 4, writingDirection: 'ltr' }]}
            >
              <Text style={{ color: c.ink }}>{doneN}</Text> / {rows.length}
            </Text>
          </View>
        </View>

        <Ledger>
          {rows.map((k) => (
            <SwipeableRow
              key={k.id}
              onComplete={() => toggle(k.id)}
              onSnooze={() => clear(k.id)}
              onPickDate={onPickDate}
              onDelete={() => clear(k.id)}
              onLongPress={() => navigation.navigate('TaskDetail')}
            >
              <TaskRow
                title={k.title}
                meta={k.meta}
                done={!!done[k.id]}
                overdue={k.over}
                onToggle={() => toggle(k.id)}
                accessibilityActions={swipeActions}
                onAccessibilityAction={(e) => {
                  const action = e.nativeEvent.actionName;
                  if (action === 'complete') toggle(k.id);
                  if (action === 'snooze') clear(k.id);
                  if (action === 'pickDate') onPickDate();
                  if (action === 'delete') clear(k.id);
                }}
              />
            </SwipeableRow>
          ))}

          <EmptyRules count={4} />
        </Ledger>
      </ScrollView>
    </Screen>
  );
}
