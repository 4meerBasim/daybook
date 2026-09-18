import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, insetStart, marginStart, pad, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { load, dayPool } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { TallyMarks } from '../components/TallyMarks';

type Cell = { n: number; count: number; today: boolean };

export function CalendarScreen() {
  const { c, t, ar, rtl, display, ui, mono } = useTheme();
  const { sel, setSel } = useStore();
  const top = useHeaderTop();

  const offset = ar ? 3 : 1;
  const cells: (Cell | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= 30; d++) cells.push({ n: d, count: load[d] ?? 0, today: d === 18 });
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Cell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const selN = load[sel] ?? 0;
  const pool = dayPool(t);
  const selItems = sel === 18 ? pool.slice(0, 3) : pool.slice(0, Math.min(selN, 3));
  const selDayLabel = (ar ? 'سبتمبر ' : 'September ') + sel;
  const selCount = String(sel === 18 ? 3 : selN);

  return (
    <Screen>
      <View style={{ flex: 1, paddingBottom: metrics.tabBar }}>
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
            {t.month}
          </Text>
          <Text style={[mono(13, 500), { color: c.ink3, paddingBottom: 6 }]}>2026</Text>
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
                const fg = cell.today ? c.ver : cell.n < 18 ? c.ink3 : c.ink;
                const tallyColor = cell.today ? c.ver : c.ink2;
                return (
                  <Pressable
                    key={ci}
                    onPress={() => setSel(cell.n)}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.month} ${cell.n}`}
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
                height: 56,
                flexDirection: row(rtl),
                alignItems: 'baseline',
                gap: 10,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, 66, metrics.gutter),
            ]}
          >
            <Text style={[display(20, { weight: 400, italic: true }), { color: c.ink }]}>
              {selDayLabel}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[mono(12, 500), { color: c.ink3 }]}>{selCount}</Text>
          </View>

          {selItems.map((k, i) => (
            <View
              key={i}
              style={[
                {
                  flexDirection: row(rtl),
                  alignItems: 'center',
                  gap: 14,
                  height: 56,
                  borderBottomWidth: 1,
                  borderBottomColor: c.rule,
                },
                pad(rtl, 16, metrics.gutter),
              ]}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderWidth: 1.5,
                  borderColor: c.ink,
                  borderRadius: 4,
                }}
              />
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.6}
                style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 16)]}
              >
                {k.title}
              </Text>
              {k.meta ? <Text style={[mono(12, 500), { color: c.ink3 }]}>{k.meta}</Text> : null}
            </View>
          ))}

          <View style={{ height: 120 }}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={{ height: 56, borderBottomWidth: 1, borderBottomColor: c.rule }}
              />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
