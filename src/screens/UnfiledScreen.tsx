import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { addDays, longDate, startOfDay } from '../lib/date';
import { useStore } from '../state/store';
import { inkDecay } from '../lib/decay';
import { rowTitle } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { TriageChip } from '../components/TriageChip';
import { SwipeableRow } from '../components/SwipeableRow';
import { ChevronBackIcon } from '../components/Icon';

export function UnfiledScreen({
  onBack,
  onOpenTask,
}: {
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const { c, t, display, ui, rtl } = useTheme();
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const { unfiled, someday, waiting, decayOn, complete, reschedule, shelve, unshelve, unblock, remove } =
    useStore();

  const now = Date.now();

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'today', label: t.bringBack },
    { name: 'someday', label: t.shelveIt },
    { name: 'snooze', label: t.tomorrow },
    { name: 'delete', label: t.delete },
  ];

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
            {t.unfiled}
          </Text>
        </View>

        {unfiled.length === 0 && someday.length === 0 && waiting.length === 0 ? (
          <View style={{ paddingHorizontal: metrics.gutter, paddingBottom: 24, gap: 4 }}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(17, 400, 22), { color: c.ink2, textAlign: align(rtl) }]}
            >
              {t.unfiledEmpty}
            </Text>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                display(15, { weight: 400, italic: true }),
                { color: c.ink3, textAlign: align(rtl) },
              ]}
            >
              {t.unfiledEmptyHint}
            </Text>
          </View>
        ) : null}

        <Ledger>
          {unfiled.map((k) => {
            const done = k.completedAt !== null;
            return (
              <SwipeableRow
                key={k.id}
                onComplete={() => complete(k.id, !done)}
                onSnooze={() => reschedule(k.id, startOfDay(addDays(Date.now(), 1)))}
                onDelete={() => remove(k.id)}
                onLongPress={() => onOpenTask(k.id)}
              >
                <TaskRow
                  title={rowTitle(k, t)}
                  done={done}
                  decay={inkDecay(k, now, decayOn)}
                  onToggle={() => complete(k.id, !done)}
                  actions={
                    done ? null : (
                      <>
                        <TriageChip
                          label={t.bringBack}
                          tint={c.blueS}
                          onPress={() => reschedule(k.id, startOfDay(now))}
                        />
                        <TriageChip
                          label={t.shelveIt}
                          tint={c.ochS}
                          onPress={() => shelve(k.id)}
                        />
                      </>
                    )
                  }
                  accessibilityActions={swipeActions}
                  onAccessibilityAction={(e) => {
                    const action = e.nativeEvent.actionName;
                    if (action === 'complete') complete(k.id, !done);
                    if (action === 'today') reschedule(k.id, startOfDay(now));
                    if (action === 'someday') shelve(k.id);
                    if (action === 'snooze') reschedule(k.id, startOfDay(addDays(now, 1)));
                    if (action === 'delete') remove(k.id);
                  }}
                />
              </SwipeableRow>
            );
          })}

          {waiting.length ? (
            <>
              <SectionLabel label={t.waiting} />
              {waiting.map((k) => (
                <SwipeableRow
                  key={k.id}
                  onComplete={() => complete(k.id, true)}
                  onDelete={() => remove(k.id)}
                  onLongPress={() => onOpenTask(k.id)}
                >
                  <TaskRow
                    title={rowTitle(k, t)}
                    meta={k.blockedBy ?? undefined}
                    decay={inkDecay(k, now, decayOn)}
                    onToggle={() => complete(k.id, true)}
                    actions={
                      <TriageChip
                        label={t.notWaiting}
                        tint={c.mossS}
                        onPress={() => unblock(k.id)}
                      />
                    }
                    accessibilityActions={[
                      { name: 'complete', label: t.done },
                      { name: 'unblock', label: t.notWaiting },
                      { name: 'delete', label: t.delete },
                    ]}
                    onAccessibilityAction={(e) => {
                      const action = e.nativeEvent.actionName;
                      if (action === 'complete') complete(k.id, true);
                      if (action === 'unblock') unblock(k.id);
                      if (action === 'delete') remove(k.id);
                    }}
                  />
                </SwipeableRow>
              ))}
            </>
          ) : null}

          {someday.length ? (
            <>
              <SectionLabel label={t.someday} />
              {someday.map((k) => (
                <SwipeableRow
                  key={k.id}
                  onComplete={() => complete(k.id, true)}
                  onDelete={() => remove(k.id)}
                  onLongPress={() => onOpenTask(k.id)}
                >
                  <TaskRow
                    title={rowTitle(k, t)}
                    decay={inkDecay(k, now, decayOn)}
                    onToggle={() => complete(k.id, true)}
                    actions={
                      <TriageChip
                        label={t.bringBack}
                        tint={c.blueS}
                        onPress={() => unshelve(k.id, startOfDay(now))}
                      />
                    }
                    accessibilityActions={[
                      { name: 'complete', label: t.done },
                      { name: 'today', label: t.bringBack },
                      { name: 'delete', label: t.delete },
                    ]}
                    onAccessibilityAction={(e) => {
                      const action = e.nativeEvent.actionName;
                      if (action === 'complete') complete(k.id, true);
                      if (action === 'today') unshelve(k.id, startOfDay(now));
                      if (action === 'delete') remove(k.id);
                    }}
                  />
                </SwipeableRow>
              ))}
            </>
          ) : null}

          <EmptyRules count={unfiled.length || someday.length || waiting.length ? 4 : 2} />
        </Ledger>
      </ScrollView>
    </Screen>
  );
}
