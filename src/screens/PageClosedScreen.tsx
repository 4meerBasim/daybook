import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align } from '../lib/rtl';
import { longDate, stamped } from '../lib/date';
import { Screen, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger, LedgerRow } from '../components/Ledger';
import { Stamp } from '../components/Stamp';

export function PageClosedScreen({ onPlanTomorrow }: { onPlanTomorrow: () => void }) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const bottom = useScreenBottom();
  const struck = [t.task1, t.task2, t.task3, t.task4, t.task5];
  const now = Date.now();

  return (
    <Screen>
      <View style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={[display(15, { italic: true }), { color: c.ink2, textAlign: align(rtl) }]}>
          {longDate(now, t)}
        </Text>
        <Text style={[display(40), { color: c.ink, textAlign: align(rtl) }]}>{t.today}</Text>
      </View>

      <Ledger>
        {struck.map((line, i) => (
          <LedgerRow key={i} start={metrics.content}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                ui(17, 400, 22),
                {
                  flex: 1,
                  minWidth: 0,
                  color: c.ink3,
                  textDecorationLine: 'line-through',
                  textAlign: align(rtl),
                },
              ]}
            >
              {line}
            </Text>
          </LedgerRow>
        ))}

        <EmptyRules count={1} />

        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 96, left: 0, right: 0, alignItems: 'center' }}
        >
          <Stamp label={t.pageClosed} timestamp={stamped(now)} size={26} />
        </View>
      </Ledger>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: bottom }}>
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
            minHeight: metrics.ruling,
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
