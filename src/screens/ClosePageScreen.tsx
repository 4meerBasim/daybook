import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { addDays, longDate, startOfDay } from '../lib/date';
import { useStore } from '../state/store';
import { rowTitle, type Outcome, type TaskRow as TaskRowData } from '../db/schema';
import type { Decision } from '../db/queries';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { Ledger, useRuling } from '../components/Ledger';
import { Sheet, SheetRow } from '../components/Sheet';
import { ChevronBackIcon } from '../components/Icon';

const MOVE_OPTIONS = [3, 7] as const;

function OutcomeButton({
  label,
  on,
  tint,
  onPress,
}: {
  label: string;
  on: boolean;
  tint: string;
  onPress: () => void;
}) {
  const { c, ui, chipPadding } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={label}
      hitSlop={{ top: 10, bottom: 10 }}
      style={{
        minHeight: 26,
        paddingHorizontal: chipPadding,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: on ? tint : c.rule,
        backgroundColor: on ? tint : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[ui(12, 500), { lineHeight: undefined, color: on ? c.paper : c.ink2 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function DecisionRow({
  task,
  outcome,
  onCarry,
  onStrike,
  onMove,
}: {
  task: TaskRowData;
  outcome: Outcome | undefined;
  onCarry: () => void;
  onStrike: () => void;
  onMove: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();

  return (
    <View
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View
        onLayout={onContentLayout}
        style={[
          { flexDirection: row(rtl), alignItems: 'center', gap: 10, paddingVertical: metrics.rowPad },
          pad(rtl, metrics.gutter, metrics.gutter),
        ]}
      >
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              ui(17, 400, 22),
              {
                color: outcome === 'struck' ? c.ink3 : c.ink,
                textAlign: align(rtl),
                textDecorationLine: outcome === 'struck' ? 'line-through' : 'none',
              },
            ]}
          >
            {rowTitle(task, t)}
          </Text>
          {task.carryCount ? (
            <Text style={[mono(11, 500, 0.1), { color: c.och, textAlign: align(rtl) }]}>
              {t.carriedTimes.replace('{n}', String(task.carryCount))}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: row(rtl), gap: 6 }}>
          <OutcomeButton label={t.carry} on={outcome === 'carried'} tint={c.ink} onPress={onCarry} />
          <OutcomeButton label={t.strike} on={outcome === 'struck'} tint={c.ver} onPress={onStrike} />
          <OutcomeButton
            label={t.move}
            on={outcome === 'rescheduled'}
            tint={c.blue}
            onPress={onMove}
          />
        </View>
      </View>
    </View>
  );
}

export function ClosePageScreen({
  onBack,
  onClosed,
}: {
  onBack: () => void;
  onClosed: () => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { today, closePage } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();

  const open = today.filter((k) => k.completedAt === null);
  const settledCount = today.length - open.length;

  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [moving, setMoving] = useState<TaskRowData | null>(null);

  const decide = (task: TaskRowData, outcome: Outcome, dueDate?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDecisions((prev) => ({ ...prev, [task.id]: { task, outcome, dueDate } }));
  };

  const decided = open.every((k) => decisions[k.id]);
  const now = Date.now();

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
            {longDate(now, t)}
          </Text>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.closeThePage}
          </Text>
          <Text
            style={[ui(15, 400, 22), { color: c.ink2, marginTop: 6, textAlign: align(rtl) }]}
          >
            {t.closeHint}
          </Text>
        </View>

        <Ledger>
          {open.map((k) => (
            <DecisionRow
              key={k.id}
              task={k}
              outcome={decisions[k.id]?.outcome}
              onCarry={() => decide(k, 'carried', startOfDay(addDays(now, 1)))}
              onStrike={() => decide(k, 'struck')}
              onMove={() => setMoving(k)}
            />
          ))}
        </Ledger>

        <View style={{ paddingHorizontal: metrics.gutter, paddingTop: 20, gap: 12 }}>
          <Text style={[mono(12, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {settledCount} {t.settledWord}
          </Text>

          <Pressable
            onPress={async () => {
              await closePage(Object.values(decisions));
              onClosed();
            }}
            disabled={!decided}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.stampThePage}
            accessibilityState={{ disabled: !decided }}
            style={{
              minHeight: metrics.ruling,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: decided ? c.ink : c.rule,
              backgroundColor: decided ? c.ink : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[ui(17, 500), { color: decided ? c.paper : c.ink3 }]}>
              {t.stampThePage}
            </Text>
          </Pressable>

          {decided ? null : (
            <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.everyRowNeedsADecision}
            </Text>
          )}
        </View>
      </ScrollView>

      {moving ? (
        <Sheet onClose={() => setMoving(null)}>
          {MOVE_OPTIONS.map((days) => (
            <SheetRow
              key={days}
              label={longDate(addDays(now, days), t)}
              onPress={() => {
                decide(moving, 'rescheduled', startOfDay(addDays(now, days)));
                setMoving(null);
              }}
            >
              <Text style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }]}>
                {longDate(addDays(now, days), t)}
              </Text>
              <Text style={[mono(12, 500), { color: c.ink3 }]}>
                {t.inDays.replace('{n}', String(days))}
              </Text>
            </SheetRow>
          ))}
        </Sheet>
      ) : null}
    </Screen>
  );
}
