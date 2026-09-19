import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { align, insetEnd, insetStart } from '../lib/rtl';
import { Screen } from '../components/Screen';
import { EmptyRules, Ledger } from '../components/Ledger';
import { Stamp } from '../components/Stamp';

export function PageClosedScreen({ onPlanTomorrow }: { onPlanTomorrow: () => void }) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const struck = [t.task1, t.task2, t.task3, t.task4, t.task5];

  return (
    <Screen>
      <View style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={[display(15, { italic: true }), { color: c.ink2, textAlign: align(rtl) }]}>
          {t.dateLine}
        </Text>
        <Text style={[display(40), { color: c.ink, textAlign: align(rtl) }]}>{t.today}</Text>
      </View>

      <Ledger>
        <EmptyRules count={6} />

        <View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 0 },
            insetStart(rtl, metrics.content),
            insetEnd(rtl, metrics.gutter),
          ]}
        >
          {struck.map((line, i) => (
            <View key={i} style={{ height: metrics.row, justifyContent: 'center' }}>
              <Text
                maxFontSizeMultiplier={1.6}
                style={[
                  ui(17),
                  { color: c.ink3, textDecorationLine: 'line-through', textAlign: align(rtl) },
                ]}
              >
                {line}
              </Text>
            </View>
          ))}
        </View>

        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 96, left: 0, right: 0, alignItems: 'center' }}
        >
          <Stamp label={t.pageClosed} timestamp="18 · 09 · 2026 — 17:42" size={26} />
        </View>
      </Ledger>

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={[display(24, { italic: true }), { color: c.ink, textAlign: align(rtl) }]}>
          {t.closingLine}
        </Text>
        <Text style={[mono(13, 500), { color: c.ink3, marginTop: 8, textAlign: align(rtl) }]}>
          5 {t.tasks} · 1 {t.habitWord} · {t.streak} 13
        </Text>

        <Pressable
          onPress={onPlanTomorrow}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.planTomorrow}
          style={{
            height: metrics.row,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 28,
          }}
        >
          <Text style={[ui(17, 500), { color: c.ink }]}>{t.planTomorrow}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
