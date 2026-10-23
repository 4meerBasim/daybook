import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { longDate } from '../lib/date';
import { useStore } from '../state/store';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger, useRuling } from '../components/Ledger';
import { TallyMarks } from '../components/TallyMarks';
import { ChevronBackIcon } from '../components/Icon';

export function ClosedPagesScreen({
  onBack,
  onOpenDay,
}: {
  onBack: () => void;
  onOpenDay: (day: number) => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { closedDays } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();

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
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.closedPages}
          </Text>

          {closedDays.length ? null : (
            <Text
              style={[
                display(15, { weight: 400, italic: true }),
                { color: c.ink3, marginTop: 4, textAlign: align(rtl) },
              ]}
            >
              {t.closedPagesEmpty}
            </Text>
          )}
        </View>

        <Ledger>
          {closedDays.map((d) => (
            <ClosedDayRow key={d.day} onPress={() => onOpenDay(d.day)}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  maxFontSizeMultiplier={maxFontSizeMultiplier}
                  style={[ui(17, 400, 22), { color: c.ink, textAlign: align(rtl) }]}
                >
                  {longDate(d.day, t)}
                </Text>
              </View>
              <TallyMarks count={d.settled} color={c.moss} />
              <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
                {d.settled}/{d.settled + d.carried + d.struck + d.rescheduled}
              </Text>
            </ClosedDayRow>
          ))}

          <EmptyRules count={closedDays.length ? 2 : 4} />
        </Ledger>
      </ScrollView>
    </Screen>
  );
}

function ClosedDayRow({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const { c, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      style={({ pressed }) => ({
        height,
        justifyContent: 'center',
        backgroundColor: pressed ? c.paper2 : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      })}
    >
      <View
        onLayout={onContentLayout}
        style={[
          {
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: metrics.gap,
            paddingVertical: metrics.rowPad,
          },
          pad(rtl, metrics.content, metrics.gutter),
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
}
