import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, insetStart, pad, row } from '../lib/rtl';
import { addDays, dayAndMonth, minutesLabel, startOfDay, startOfWeek, weekdayIndex } from '../lib/date';
import { useStore } from '../state/store';
import type { ClosedDayRow } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TallyMarks } from '../components/TallyMarks';
import { ChevronBackIcon } from '../components/Icon';

const WEEK = 7;

function SpreadRow({
  label,
  date,
  settled,
  total,
  dim,
}: {
  label: string;
  date?: string;
  settled: number;
  total: number;
  dim: boolean;
}) {
  const { c, mono, ui, rtl, unit } = useTheme();
  return (
    <View
      style={{
        minHeight: unit,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View
        style={[
          { flexDirection: row(rtl), alignItems: 'center', gap: metrics.gap },
          pad(rtl, metrics.content, metrics.gutter),
        ]}
      >
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[ui(15), { flex: 1, color: dim ? c.ink3 : c.ink, textAlign: align(rtl) }]}
        >
          {label}
        </Text>
        {date ? <Text style={[mono(11, 500, 0.1), { color: c.ink3 }]}>{date}</Text> : null}
        {total ? <TallyMarks count={settled} color={c.moss} /> : null}
        <Text
          numberOfLines={1}
          style={[mono(12, 500), { minWidth: 40, color: c.ink3, textAlign: 'right' }]}
        >
          {total ? `${settled}/${total}` : '—'}
        </Text>
      </View>
    </View>
  );
}

function Balance({ label, value, tint }: { label: string; value: string; tint?: string }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View style={{ flexDirection: row(rtl), alignItems: 'baseline', gap: 8 }}>
      <Text style={[mono(11, 500, 0.1), { flex: 1, color: c.ink3 }]}>{label}</Text>
      <Text style={[mono(15, 500), { color: tint ?? c.ink }]}>{value}</Text>
    </View>
  );
}

function totals(days: ClosedDayRow[]) {
  return days.reduce(
    (sum, d) => ({
      settled: sum.settled + d.settled,
      carried: sum.carried + d.carried,
      struck: sum.struck + d.struck,
      rescheduled: sum.rescheduled + d.rescheduled,
      shelved: sum.shelved + d.shelved,
      committedMinutes: sum.committedMinutes + d.committedMinutes,
      settledMinutes: sum.settledMinutes + d.settledMinutes,
    }),
    {
      settled: 0,
      carried: 0,
      struck: 0,
      rescheduled: 0,
      shelved: 0,
      committedMinutes: 0,
      settledMinutes: 0,
    }
  );
}

export function WeeklyScreen({ onBack }: { onBack: () => void }) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { closedDays } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const [weeksBack, setWeeksBack] = useState(0);

  const weekStart = startOfWeek(addDays(Date.now(), -weeksBack * WEEK), t.firstWeekday);
  const weekEnd = startOfDay(addDays(weekStart, WEEK));

  const week = closedDays.filter((d) => d.day >= weekStart && d.day < weekEnd);
  const sum = totals(week);
  const committed = sum.settled + sum.carried + sum.struck + sum.rescheduled + sum.shelved;

  const heat = Array.from({ length: WEEK }, (_, i) =>
    closedDays
      .filter((d) => weekdayIndex(d.day, t.firstWeekday) === i)
      .reduce((n, d) => n + d.settled, 0)
  );
  const heatPeak = Math.max(...heat, 1);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <View style={{ flexDirection: row(rtl), marginBottom: 4 }}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t.back}
              android_ripple={null}
              style={{
                width: metrics.minTap,
                height: metrics.minTap,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronBackIcon color={c.ink2} flip={rtl} />
            </Pressable>
          </View>

          <Text
            style={[
              display(15, { weight: 400, italic: true }),
              { color: c.ink2, textAlign: align(rtl) },
            ]}
          >
            {dayAndMonth(weekStart, t)} {'–'} {dayAndMonth(addDays(weekStart, WEEK - 1), t)}
          </Text>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {weeksBack ? t.weekSpread : t.thisWeekTitle}
          </Text>

          <View style={{ flexDirection: row(rtl), gap: 16, marginTop: 8 }}>
            <Pressable
              onPress={() => setWeeksBack((n) => n + 1)}
              hitSlop={metrics.hitSlop}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.earlierWeek}
            >
              <Text style={[mono(12, 500, 0.1), { color: c.ink2 }]}>{t.earlierWeek}</Text>
            </Pressable>
            {weeksBack ? (
              <Pressable
                onPress={() => setWeeksBack((n) => Math.max(0, n - 1))}
                hitSlop={metrics.hitSlop}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={t.laterWeek}
              >
                <Text style={[mono(12, 500, 0.1), { color: c.ink2 }]}>{t.laterWeek}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Ledger>
          {Array.from({ length: WEEK }, (_, i) => {
            const day = startOfDay(addDays(weekStart, i));
            const closed = week.find((d) => d.day === day);
            const total = closed
              ? closed.settled + closed.carried + closed.struck + closed.rescheduled + closed.shelved
              : 0;
            return (
              <SpreadRow
                key={day}
                label={t.weekdays[i]}
                date={dayAndMonth(day, t)}
                settled={closed ? closed.settled : 0}
                total={total}
                dim={!closed}
              />
            );
          })}
        </Ledger>

        <View style={{ paddingHorizontal: metrics.gutter, paddingTop: 24, gap: 10 }}>
          <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {t.balance}
          </Text>
          <Balance label={t.committedWord} value={String(committed)} />
          <Balance label={t.settledWord} value={String(sum.settled)} tint={c.moss} />
          <Balance label={t.carriedWord} value={String(sum.carried)} />
          <Balance label={t.movedWord} value={String(sum.rescheduled + sum.shelved)} />
          <Balance label={t.struckWord} value={String(sum.struck)} tint={c.ver} />
          {sum.committedMinutes ? (
            <Balance
              label={t.hoursWord}
              value={`${minutesLabel(sum.settledMinutes, t)} / ${minutesLabel(sum.committedMinutes, t)}`}
            />
          ) : null}
        </View>

        <View style={{ paddingTop: 24 }}>
          <SectionLabel label={t.whenWorkHappens} />
          <View style={{ position: 'relative' }}>
            <View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: c.ver,
                  opacity: 0.6,
                },
                insetStart(rtl, metrics.marginLine),
              ]}
            />
            {heat.map((count, i) => (
              <SpreadRow
                key={i}
                label={t.weekdays[i]}
                settled={Math.round((count / heatPeak) * 5)}
                total={count}
                dim={count === 0}
              />
            ))}
          </View>
          <EmptyRules count={2} />
        </View>
      </ScrollView>
    </Screen>
  );
}
