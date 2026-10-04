import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { collectTags } from '../lib/matches';
import { useHabits, useJournals, useOnThisDay, useStore, useStreak, useTasks } from '../state/store';
import { useDeviceCalendarEvents } from '../hooks/useDeviceCalendarEvents';
import { dayKey, formatTime, relativeYears, startOfToday, toArabicDigits } from '../lib/day';
import { promptForDate } from '../data/prompts';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { AddRow, Checkbox, Dot, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { ProjectRows } from '../components/ProjectRows';
import { TagFilterBar } from '../components/TagFilterBar';
import { Stamp } from '../components/Stamp';
import { JournalIcon, StreakTallyIcon, TimelineIcon } from '../components/Icon';

function firstLine(value: string): string {
  return value.split('\n')[0].trim();
}

export function TodayScreen({
  onStamp,
  onOpenProject,
  onOpenHabit,
  onAddProject,
  onAddHabit,
  onOpenEntry,
  onOpenTimeline,
}: {
  onStamp: () => void;
  onOpenProject: (projectId: string | null) => void;
  onOpenHabit: (habitId: string) => void;
  onAddProject: () => void;
  onAddHabit: () => void;
  onOpenEntry: (entryId: string | null) => void;
  onOpenTimeline: () => void;
}) {
  const { c, t, ar, lang, ui, mono, display, rtl } = useTheme();
  const { done, habitSessions, entries, currentJournalId, setCurrentJournal } = useStore();
  const habits = useHabits();
  const journals = useJournals();
  const streak = useStreak();
  const memories = useOnThisDay();
  const dayStart = new Date(startOfToday());
  const dayEnd = new Date(startOfToday() + 24 * 60 * 60 * 1000);
  const deviceEvents = useDeviceCalendarEvents(dayStart, dayEnd);
  const todayKey = dayKey(new Date());
  const currentYear = new Date().getFullYear();
  const todaysEntry = entries.find((e) => e.journalId === currentJournalId && e.day === todayKey);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const all = useTasks();
  const leftN = all.filter((k) => k.list === 'today' && !k.later && !done[k.id]).length;
  const allDone = leftN === 0;

  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';

  const tags = collectTags(all.filter((k) => k.list === 'today'));
  const [tag, setTag] = useState<string | null>(null);
  const sel = tag && tags.includes(tag) ? tag : null;

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

        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t.switchJournal}
          style={{ marginBottom: 4 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: metrics.gutter, gap: 8, flexDirection: row(rtl) }}
          >
            {journals.map((j) => {
              const on = j.id === currentJournalId;
              return (
                <Pressable
                  key={j.id}
                  onPress={() => setCurrentJournal(j.id)}
                  android_ripple={null}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={j.name}
                  style={{
                    minHeight: 44,
                    flexDirection: row(rtl),
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 12,
                    borderRadius: radius.chip,
                    borderWidth: 1,
                    borderColor: on ? c.ink : c.rule,
                    backgroundColor: on ? c.paper2 : 'transparent',
                  }}
                >
                  <JournalIcon name={j.icon} size={18} color={c[j.color]} />
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.4}
                    style={[ui(14, 500), { color: on ? c.ink : c.ink2, lineHeight: undefined }]}
                  >
                    {j.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {todaysEntry ? (
          <DailyNoteCard
            primary={
              todaysEntry.title.trim() !== ''
                ? todaysEntry.title.trim()
                : firstLine(todaysEntry.body)
            }
            secondary={
              todaysEntry.title.trim() !== ''
                ? todaysEntry.body.trim()
                : todaysEntry.body.split('\n').slice(1).join('\n').trim()
            }
            streak={streak}
            onPress={() => onOpenEntry(todaysEntry.id)}
          />
        ) : (
          <View
            style={{
              marginHorizontal: metrics.gutter,
              marginTop: 12,
              marginBottom: 4,
              padding: 16,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: c.rule,
              backgroundColor: c.card,
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: row(rtl),
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={[mono(11, 500, 0.1, true), { color: c.ink3 }]}>{t.todaysNote}</Text>
              <StreakChip streak={streak} />
            </View>
            <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.todaysPrompt}
            </Text>
            <Text style={[display(18, { lineHeight: 25 }), { color: c.ink2, textAlign: align(rtl) }]}>
              {promptForDate(new Date(), lang)}
            </Text>
            <Pressable
              onPress={() => onOpenEntry(null)}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.openTodaysNote}
              style={({ pressed }) => ({
                minHeight: 44,
                marginTop: 4,
                borderRadius: radius.chip,
                backgroundColor: pressed ? c.ink2 : c.ink,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={[ui(15, 500), { color: c.paper, lineHeight: undefined }]}>
                {t.openTodaysNote}
              </Text>
            </Pressable>
          </View>
        )}

        {memories.length ? (
          <View style={{ marginTop: 8 }}>
            <SectionLabel label={t.onThisDay} />
            {memories.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => onOpenEntry(e.id)}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={`${relativeYears(
                  currentYear - Number(e.day.slice(0, 4)),
                  ar
                )}, ${e.title.trim() !== '' ? e.title.trim() : firstLine(e.body)}`}
                style={({ pressed }) => [
                  {
                    minHeight: metrics.row,
                    justifyContent: 'center',
                    gap: 3,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: c.rule,
                    backgroundColor: pressed ? c.paper2 : 'transparent',
                  },
                  pad(rtl, metrics.gutter, metrics.gutter),
                ]}
              >
                <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
                  {relativeYears(currentYear - Number(e.day.slice(0, 4)), ar)}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[ui(15, 400, 21), { color: c.ink, textAlign: align(rtl) }]}
                >
                  {e.title.trim() !== '' ? e.title.trim() : firstLine(e.body)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {deviceEvents.length ? (
          <View style={{ marginTop: 8 }}>
            <SectionLabel label={t.events} />
            {deviceEvents.map((ev) => {
              const timeLabel = ev.allDay ? t.allDayEvent : formatTime(ev.start, ar);
              return (
                <View
                  key={ev.id}
                  accessible
                  accessibilityLabel={`${ev.title}, ${timeLabel}`}
                  style={[
                    {
                      minHeight: metrics.row,
                      justifyContent: 'center',
                      gap: 3,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: c.rule,
                    },
                    pad(rtl, metrics.gutter, metrics.gutter),
                  ]}
                >
                  <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
                    {ev.color ? <Dot color={ev.color} size={6} /> : null}
                    <Text style={[mono(11, 500, 0.1, true), { color: c.ink3 }]}>{timeLabel}</Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.6}
                    style={[ui(15, 400, 21), { color: c.ink, textAlign: align(rtl) }]}
                  >
                    {ev.title}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <Pressable
          onPress={onOpenTimeline}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.timelineMap}
          style={({ pressed }) => ({
            minHeight: 44,
            marginHorizontal: metrics.gutter,
            marginTop: 8,
            marginBottom: 4,
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 10,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <TimelineIcon size={20} color={c.ink3} />
          <Text style={[ui(14, 500), { color: c.ink2, lineHeight: undefined }]}>{t.timelineMap}</Text>
        </Pressable>

        <TagFilterBar tags={tags} selected={sel} onSelect={setTag} />

        <Ledger>
          <ProjectRows
            list="today"
            query={query}
            tagFilter={sel}
            onOpen={onOpenProject}
            onAdd={onAddProject}
          />

          {searching ? null : (
            <>
              <SectionLabel label={t.habits} />

              {habits.map((h) => {
                const sessions = habitSessions.filter((s) => s.habitId === h.id).length;
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => onOpenHabit(h.id)}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={[
                      h.name,
                      h.minutes > 0 ? `${t.target} ${h.minutes} ${t.minutes}` : '',
                      `${t.sessionsToday}: ${sessions}`,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    style={({ pressed }) => [
                      {
                        height: metrics.row,
                        flexDirection: row(rtl),
                        alignItems: 'center',
                        gap: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: c.rule,
                        backgroundColor: pressed ? c.paper2 : 'transparent',
                      },
                      pad(rtl, 16, metrics.gutter),
                    ]}
                  >
                    <Checkbox circle color={c.moss} checked={sessions > 0} />
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.6}
                      style={[
                        ui(17, 400, 22),
                        { flex: 1, color: c.ink, textAlign: align(rtl) },
                        marginStart(rtl, 16),
                      ]}
                    >
                      {h.name}
                    </Text>
                    {h.minutes > 0 ? (
                      <Text style={[mono(12, 500, 0, true), { color: c.ink3 }]}>
                        {`${h.minutes} ${t.minShort}`}
                      </Text>
                    ) : null}
                    {h.streak > 0 ? (
                      <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
                        <StreakTallyIcon color={c.moss} flip={rtl} />
                        <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>
                          {h.streak}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}

              <AddRow label={t.newHabit} onPress={onAddHabit} />
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
          style={{ position: 'absolute', top: 300, alignSelf: 'center' }}
        >
          <Stamp label={t.pageClosed} />
        </Pressable>
      ) : null}
    </Screen>
  );
}

function StreakChip({ streak }: { streak: number }) {
  const { c, t, ar, ui, mono, rtl } = useTheme();
  if (streak <= 0) {
    return (
      <Text
        numberOfLines={1}
        style={[ui(12, 400), { color: c.ink3, lineHeight: undefined, textAlign: align(rtl) }]}
      >
        {t.streakNudge}
      </Text>
    );
  }
  return (
    <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
      <StreakTallyIcon color={c.moss} flip={rtl} />
      <Text style={[mono(12, 500), { color: c.moss }]}>
        {`${toArabicDigits(streak, ar)} ${t.dayStreak}`}
      </Text>
    </View>
  );
}

function DailyNoteCard({
  primary,
  secondary,
  streak,
  onPress,
}: {
  primary: string;
  secondary: string;
  streak: number;
  onPress: () => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={`${t.todaysNote}, ${primary}`}
      style={({ pressed }) => ({
        marginHorizontal: metrics.gutter,
        marginTop: 12,
        marginBottom: 4,
        padding: 16,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: c.rule,
        backgroundColor: pressed ? c.paper2 : c.card,
        gap: 8,
      })}
    >
      <View
        style={{ flexDirection: row(rtl), alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={[mono(11, 500, 0.1, true), { color: c.ink3 }]}>{t.todaysNote}</Text>
        <StreakChip streak={streak} />
      </View>
      <Text
        numberOfLines={1}
        style={[display(20, { lineHeight: 26 }), { color: c.ink, textAlign: align(rtl) }]}
      >
        {primary}
      </Text>
      {secondary !== '' ? (
        <Text
          numberOfLines={2}
          style={[ui(15, 400, 21), { color: c.ink2, textAlign: align(rtl) }]}
        >
          {secondary}
        </Text>
      ) : null}
    </Pressable>
  );
}
