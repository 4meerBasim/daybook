import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, insetStart, pad, row } from '../lib/rtl';
import { addDays, dayOfMonth, startOfMonth, startOfNextMonth, timeLabel } from '../lib/date';
import { useStore } from '../state/store';
import { rowTitle } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { TallyMarks } from '../components/TallyMarks';

type Cell = { n: number; count: number; today: boolean };

export function CalendarScreen() {
  const { c, t, rtl, display, mono, unit } = useTheme();
  const { month, sel, setSel, complete } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();

  const now = Date.now();
  const d = new Date(now);
  const monthName = t.months[d.getMonth()];
  const year = d.getFullYear();
  const todayN = d.getDate();
  const offset = (new Date(startOfMonth(now)).getDay() - t.firstWeekday + 7) % 7;
  const daysInMonth = dayOfMonth(addDays(startOfNextMonth(now), -1));

  const load = new Map<number, number>();
  for (const k of month) {
    const day = dayOfMonth(k.dueDate);
    load.set(day, (load.get(day) ?? 0) + 1);
  }

  const cells: (Cell | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let n = 1; n <= daysInMonth; n++) cells.push({ n, count: load.get(n) ?? 0, today: n === todayN });
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Cell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const selItems = month.filter((k) => dayOfMonth(k.dueDate) === sel);
  const selDayLabel = `${monthName} ${sel}`;

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: metrics.gutter,
            paddingBottom: 8,
            flexDirection: row(rtl),
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <Text style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}>
            {monthName}
          </Text>
          <Text style={[mono(13, 500), { color: c.ink3, paddingBottom: 6 }]}>{year}</Text>
        </View>

        <View
          style={{
            flexDirection: row(rtl),
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.rule,
          }}
        >
          {t.wd.map((w, i) => (
            <Text
              key={i}
              style={[
                mono(11, 500),
                { flex: 1, textAlign: 'center', color: c.ink3, paddingVertical: 6 },
              ]}
            >
              {w}
            </Text>
          ))}
        </View>

        <View style={{ paddingHorizontal: 12, paddingTop: 4 }}>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: row(rtl) }}>
              {week.map((cell, ci) => {
                if (!cell) return <View key={ci} style={{ flex: 1, height: 56 }} />;
                const selected = cell.n === sel;
                const fg = cell.today ? c.ver : cell.n < todayN ? c.ink3 : c.ink;
                const tallyColor = cell.today ? c.ver : c.ink2;
                return (
                  <Pressable
                    key={ci}
                    onPress={() => setSel(cell.n)}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={`${monthName} ${cell.n}`}
                    accessibilityState={{ selected }}
                    style={{
                      flex: 1,
                      height: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      borderRadius: 8,
                      backgroundColor: selected ? c.paper2 : 'transparent',
                    }}
                  >
                    <Text
                      style={[
                        mono(15, 500),
                        {
                          color: fg,
                          borderBottomWidth: 1.5,
                          borderBottomColor: cell.today ? c.ver : 'transparent',
                        },
                      ]}
                    >
                      {cell.n}
                    </Text>
                    <View style={{ height: 8, justifyContent: 'flex-end' }}>
                      <TallyMarks count={cell.count} color={tallyColor} max={5} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottom }}>
          <View style={{ borderTopWidth: 1, borderTopColor: c.rule, marginTop: 8 }}>
            <View
              style={[
                { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: c.ver, opacity: 0.6 },
                insetStart(rtl, metrics.marginLine),
              ]}
            />
            <View
              style={[
                {
                  minHeight: unit,
                  flexDirection: row(rtl),
                  alignItems: 'baseline',
                  gap: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: c.rule,
                },
                pad(rtl, metrics.content, metrics.gutter),
              ]}
            >
              <Text style={[display(20, { weight: 400, italic: true }), { color: c.ink }]}>
                {selDayLabel}
              </Text>
              <View style={{ flex: 1 }} />
              <Text style={[mono(12, 500), { color: c.ink3 }]}>{selItems.length}</Text>
            </View>

            {selItems.map((k) => {
              const done = k.completedAt !== null;
              return (
                <TaskRow
                  key={k.id}
                  title={rowTitle(k, t)}
                  meta={timeLabel(k.dueDate)}
                  done={done}
                  rule
                  onToggle={() => complete(k.id, !done)}
                />
              );
            })}

            <EmptyRules count={2} />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
