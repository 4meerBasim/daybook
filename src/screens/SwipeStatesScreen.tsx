import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { Screen } from '../components/Screen';
import { Checkbox, EmptyRules, Ledger, rowContent, useRuling } from '../components/Ledger';
import { CheckIcon, DragHandleIcon } from '../components/Icon';

const fill = { position: 'absolute' as const, top: 0, bottom: 0, left: 0, right: 0 };

function DemoRow({
  title,
  offset,
  pane,
  lifted = false,
  trailing,
}: {
  title: string;
  offset: number;
  pane?: React.ReactNode;
  lifted?: boolean;
  trailing?: React.ReactNode;
}) {
  const { c, ui, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();

  return (
    <View
      style={{
        position: 'relative',
        height,
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
            backgroundColor: lifted ? c.paper2 : c.paper,
            justifyContent: 'center',
            transform: [{ translateX: offset }],
          },
        ]}
      >
        <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
          <Checkbox />
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              ui(17, 400, 22),
              { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
              marginStart(rtl, 16),
            ]}
          >
            {title}
          </Text>
          {trailing}
        </View>
      </View>
    </View>
  );
}

export function SwipeStatesScreen() {
  const { c, t, ui, mono, rtl, unit } = useTheme();

  const sign = rtl ? -1 : 1;
  const actionText = [ui(13, 500), { lineHeight: undefined }];

  const annotation = (label: string) => (
    <View
      style={[
        {
          minHeight: unit,
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
        <DemoRow
          title={t.task3}
          offset={96 * sign}
          pane={
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
          }
        />
        {annotation(t.swipe1)}

        <DemoRow
          title={t.task5}
          offset={-150 * sign}
          pane={
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
          }
        />
        {annotation(t.swipe2)}

        <DemoRow
          title={t.task4}
          offset={-200 * sign}
          pane={
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
          }
        />
        {annotation(t.swipe3)}

        <DemoRow
          title={t.task1}
          offset={0}
          lifted
          trailing={<DragHandleIcon size={20} color={c.ink3} />}
        />
        {annotation(t.swipe4)}

        <EmptyRules count={2} />
      </Ledger>
    </Screen>
  );
}
