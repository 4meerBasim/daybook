import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { toArabicDigits } from '../lib/day';
import { useFocusStats, useJournals, useKarma, useStore, useStreak, useTasks } from '../state/store';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { ChevronBackIcon, StreakTallyIcon } from '../components/Icon';

export function ProfileScreen({
  onOpenProject,
  onOpenSettings,
  onOpenJournals,
  onOpenSmartLists,
  onOpenTagBrowser,
  onOpenEisenhower,
  onOpenSearch,
}: {
  onOpenProject: () => void;
  onOpenSettings: () => void;
  onOpenJournals: () => void;
  onOpenSmartLists: () => void;
  onOpenTagBrowser: () => void;
  onOpenEisenhower: () => void;
  onOpenSearch: () => void;
}) {
  const { c, t, ar, ui, mono, display, rtl } = useTheme();
  const { done } = useStore();
  const streak = useStreak();
  const journalCount = useJournals().length;
  const focus = useFocusStats();
  const karma = useKarma();

  const doneToday = useTasks().filter((k) => k.list === 'today' && !k.later && done[k.id]).length;

  const fmtDuration = (seconds: number) => {
    const totalMin = Math.round(seconds / 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${toArabicDigits(h, ar)}${t.hoursShort} ${toArabicDigits(m, ar)}${t.minShort}`;
    return `${toArabicDigits(m, ar)} ${t.minShort}`;
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.tabBar }}>
        <PageHeader title={t.profile} />

        <View
          style={{
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 16,
            paddingHorizontal: metrics.gutter,
            paddingBottom: 24,
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.pen,
              backgroundColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text allowFontScaling={false} style={[display(24), { color: c.paper }]}>
              {t.profileName[0]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[display(24), { color: c.ink, textAlign: align(rtl) }]}
            >
              {t.profileName}
            </Text>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(15), { color: c.ink3, textAlign: align(rtl) }]}
            >
              {t.memberSince}
            </Text>
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
          <Row label={t.doneToday} value={String(doneToday)}>
            <Text style={[mono(13, 500), { color: c.ink3 }]}>{doneToday}</Text>
          </Row>

          <Row label={t.habitStreak} value="12">
            <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
              <StreakTallyIcon color={c.moss} flip={rtl} />
              <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>12</Text>
            </View>
          </Row>

          <Row label={t.journalStreak} value={String(streak)}>
            <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
              <StreakTallyIcon color={c.moss} flip={rtl} />
              <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>{streak}</Text>
            </View>
          </Row>

          <Row label={t.karma} value={`${t.karmaLevels[karma.level]}, ${karma.points}`}>
            <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
              <Text style={[ui(13), { color: c.ink3 }]}>
                {`${t.level} ${toArabicDigits(karma.level + 1, ar)} · ${t.karmaLevels[karma.level]}`}
              </Text>
              <Text style={[mono(13, 500), { color: c.ink }]}>{toArabicDigits(karma.points, ar)}</Text>
            </View>
          </Row>

          <Row label={t.focusTime} value={fmtDuration(focus.totalSeconds)}>
            <Text style={[mono(13, 500), { color: c.ink3 }]}>{fmtDuration(focus.totalSeconds)}</Text>
          </Row>

          <Row label={t.focusSessionsLabel} value={String(focus.count)}>
            <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
              <Text style={[ui(13), { color: c.ink3 }]}>
                {`${t.thisWeek} ${toArabicDigits(focus.weekCount, ar)}`}
              </Text>
              <Text style={[mono(13, 500), { color: c.ink }]}>{toArabicDigits(focus.count, ar)}</Text>
            </View>
          </Row>

          <Row label={t.search} onPress={onOpenSearch}>
            <LinkValue />
          </Row>

          <Row label={t.projects} value={t.studio} onPress={onOpenProject}>
            <LinkValue label={t.studio} />
          </Row>

          <Row label={t.journals} value={String(journalCount)} onPress={onOpenJournals}>
            <LinkValue label={String(journalCount)} />
          </Row>

          <Row label={t.settings} onPress={onOpenSettings}>
            <LinkValue />
          </Row>

          <Row label={t.smartLists} onPress={onOpenSmartLists}>
            <LinkValue />
          </Row>

          <Row label={t.tagBrowser} onPress={onOpenTagBrowser}>
            <LinkValue />
          </Row>

          <Row label={t.eisenhower} onPress={onOpenEisenhower}>
            <LinkValue />
          </Row>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
  label,
  value,
  children,
  onPress,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const { c, ui, rtl } = useTheme();
  const spoken = value ? `${label}, ${value}` : label;
  const style = {
    height: metrics.row,
    flexDirection: row(rtl),
    alignItems: 'center' as const,
    gap: 12,
    paddingHorizontal: metrics.gutter,
    borderBottomWidth: 1,
    borderBottomColor: c.rule,
  };
  const content = (
    <>
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
      >
        {label}
      </Text>
      {children}
    </>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={spoken} style={style}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      style={style}
    >
      {content}
    </Pressable>
  );
}

function LinkValue({ label }: { label?: string }) {
  const { c, ui, rtl } = useTheme();
  return (
    <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 4 }}>
      {label ? (
        <Text maxFontSizeMultiplier={maxFontSizeMultiplier} style={[ui(15), { color: c.ink3 }]}>
          {label}
        </Text>
      ) : null}
      <ChevronBackIcon size={16} color={c.ink3} flip={!rtl} />
    </View>
  );
}
