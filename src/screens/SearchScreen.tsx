import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, priorityColors, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { useProjects, useStore, useTasks } from '../state/store';
import { Entry, Project, Task } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { Dot, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { ChevronBackIcon, CloseIcon, SearchIcon } from '../components/Icon';

type Nav = { navigate: (screen: string, params?: object) => void; goBack: () => void };

const norm = (v: string | null | undefined) => (v ?? '').toLowerCase();

export function SearchScreen() {
  const { c, t, display, ui, rtl } = useTheme();
  const navigation = useNavigation() as unknown as Nav;
  const top = useHeaderTop();
  const { done, entries } = useStore();
  const allTasks = useTasks();
  const projects = useProjects();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { tasks: [] as Task[], projects: [] as Project[], entries: [] as Entry[] };
    const taskHits = allTasks.filter((k) => {
      const tags = (k.tags ?? []).join(' ');
      return (
        norm(k.title).includes(q) ||
        norm(k.meta).includes(q) ||
        norm(k.desc).includes(q) ||
        norm(tags).includes(q)
      );
    });
    const projectHits = projects.filter((p) => norm(p.name).includes(q));
    const entryHits = [...entries]
      .filter((e) => norm(e.title).includes(q) || norm(e.body).includes(q))
      .sort((a, b) => b.createdAt - a.createdAt);
    return { tasks: taskHits, projects: projectHits, entries: entryHits };
  }, [q, allTasks, projects, entries]);

  const total = results.tasks.length + results.projects.length + results.entries.length;

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12, gap: 4 }}>
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
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(34, { lineHeight: 38 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.search}
          </Text>
        </View>

        <View style={{ paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <View
            style={{
              height: 48,
              borderRadius: radius.card,
              backgroundColor: c.paper2,
              borderWidth: 1,
              borderColor: c.rule,
              flexDirection: row(rtl),
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 12,
            }}
          >
            <SearchIcon size={20} color={c.ink3} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              selectionColor={c.ink}
              placeholder={t.search}
              placeholderTextColor={c.ink3}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              accessibilityLabel={t.search}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              style={[
                ui(17),
                { flex: 1, alignSelf: 'stretch', color: c.ink, padding: 0, textAlign: align(rtl) },
              ]}
            />
            {query ? (
              <Pressable
                onPress={() => setQuery('')}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={t.clear}
                hitSlop={metrics.hitSlop}
              >
                <CloseIcon size={20} color={c.ink3} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {!q ? (
          <HintBlock label={t.searchHint} />
        ) : total === 0 ? (
          <HintBlock label={t.noResults} />
        ) : (
          <>
            {results.tasks.length ? (
              <Ledger>
                <SectionLabel label={t.searchTasks} />
                {results.tasks.map((k) => (
                  <TaskRow
                    key={k.id}
                    title={k.title}
                    meta={[k.priority && k.priority !== 'none' ? t[k.priority] : '', k.meta]
                      .filter(Boolean)
                      .join(' · ')}
                    dotColor={
                      k.priority && k.priority !== 'none'
                        ? c[priorityColors[k.priority].fg]
                        : undefined
                    }
                    done={!!done[k.id]}
                    overdue={k.over}
                    onToggle={() => navigation.navigate('TaskDetail', { taskId: k.id })}
                    accessibilityActions={[]}
                    onAccessibilityAction={() => {}}
                  />
                ))}
              </Ledger>
            ) : null}

            {results.projects.length ? (
              <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
                <SectionLabel label={t.searchProjects} />
                {results.projects.map((p) => (
                  <ResultRow
                    key={p.id}
                    title={p.name}
                    swatch={c[p.color]}
                    onPress={() => navigation.navigate('Project', { projectId: p.id })}
                  />
                ))}
              </View>
            ) : null}

            {results.entries.length ? (
              <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
                <SectionLabel label={t.searchEntries} />
                {results.entries.map((e) => (
                  <ResultRow
                    key={e.id}
                    title={e.title.trim() || t.newEntry}
                    meta={e.day}
                    onPress={() => navigation.navigate('EntryComposer', { entryId: e.id })}
                  />
                ))}
              </View>
            ) : null}

            <EmptyRules count={2} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function HintBlock({ label }: { label: string }) {
  const { c, ui, rtl } = useTheme();
  return (
    <View style={{ paddingHorizontal: metrics.gutter, paddingTop: 32 }}>
      <Text
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[ui(15, 400, 22), { color: c.ink3, textAlign: align(rtl) }]}
      >
        {label}
      </Text>
    </View>
  );
}

function ResultRow({
  title,
  meta,
  swatch,
  onPress,
}: {
  title: string;
  meta?: string;
  swatch?: string;
  onPress: () => void;
}) {
  const { c, ui, mono, rtl } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${title}, ${meta}` : title}
      style={({ pressed }) => [
        {
          minHeight: metrics.row,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
          backgroundColor: pressed ? c.paper2 : 'transparent',
        },
        pad(rtl, metrics.gutter, metrics.gutter),
      ]}
    >
      {swatch ? <Dot color={swatch} /> : null}
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[ui(17, 400, 22), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
      >
        {title}
      </Text>
      {meta ? <Text style={[mono(12, 500), { color: c.ink3 }]}>{meta}</Text> : null}
    </Pressable>
  );
}
