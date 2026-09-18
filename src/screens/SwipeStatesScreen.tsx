import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { Screen } from '../components/Screen';
import { Checkbox, EmptyRules, Ledger } from '../components/Ledger';
import { CheckIcon, DragHandleIcon } from '../components/Icon';

export function SwipeStatesScreen() {
  const { c, t, ui, mono, rtl } = useTheme();

  const sign = rtl ? -1 : 1;
  const fill = { position: 'absolute' as const, top: 0, bottom: 0, left: 0, right: 0 };
  const actionText = [ui(13, 500), { lineHeight: undefined }];

  const demoRow = (title: string, offset: number, pane: React.ReactNode) => (
    <View
      style={{
        position: 'relative',
        height: metrics.row,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
        overflow: 'hidden',
      }}
    >
      {pane}
      <View
        style={[
          fill,
          {
            backgroundColor: c.paper,
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 14,
            transform: [{ translateX: offset }],
          },
          pad(rtl, 16, metrics.gutter),
        ]}
      >
        <Checkbox />
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.6}
          style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 16)]}
        >
          {title}
        </Text>
      </View>
    </View>
  );

  const annotation = (label: string) => (
    <View
      style={[
        {
          height: metrics.row,
          flexDirection: row(rtl),
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
        },
        pad(rtl, metrics.content, metrics.gutter),
      ]}
    >
      <Text style={[ui(13), { color: c.ink3, textAlign: align(rtl) }]}>{label}</Text>
    </View>
  );

  return (
    <Screen>
      <View style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={[mono(12, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
          {t.swipeStates}
        </Text>
      </View>

      <Ledger>
        {demoRow(
          t.task3,
          96 * sign,
          <View
            style={[
              fill,
              {
                backgroundColor: c.mossS,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: metrics.gutter,
              },
            ]}
          >
            <CheckIcon width={14} height={12} color={c.moss} />
            <Text style={[actionText, { color: c.moss }]}>{t.done}</Text>
          </View>
        )}
        {annotation(t.swipe1)}

        {demoRow(
          t.task5,
          -150 * sign,
          <View
            style={[
              fill,
              {
                backgroundColor: c.blueS,
                flexDirection: row(rtl),
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 16,
                paddingHorizontal: metrics.gutter,
              },
            ]}
          >
            <Text style={[actionText, { color: c.blue }]}>{t.tomorrow}</Text>
            <Text style={[actionText, { color: c.blue }]}>{t.pickDate}</Text>
          </View>
        )}
        {annotation(t.swipe2)}

        {demoRow(
          t.task4,
          -200 * sign,
          <View
            style={[
              fill,
              {
                backgroundColor: c.verS,
                flexDirection: row(rtl),
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingHorizontal: metrics.gutter,
              },
            ]}
          >
            <Text style={[actionText, { color: c.ver }]}>{t.delete}</Text>
          </View>
        )}
        {annotation(t.swipe3)}

        <View
          style={[
            {
              height: metrics.row,
              flexDirection: row(rtl),
              alignItems: 'center',
              gap: 14,
              borderBottomWidth: 1,
              borderBottomColor: c.rule,
              backgroundColor: c.paper2,
            },
            pad(rtl, 16, metrics.gutter),
          ]}
        >
          <Checkbox />
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.6}
            style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 16)]}
          >
            {t.task1}
          </Text>
          <DragHandleIcon size={20} color={c.ink3} />
        </View>
        {annotation(t.swipe4)}

        <EmptyRules count={2} />
      </Ledger>
    </Screen>
  );
}
