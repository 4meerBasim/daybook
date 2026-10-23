import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { addDays, startOfDay } from '../lib/date';
import { useStore } from '../state/store';
import { rowTitle } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { ChevronBackIcon } from '../components/Icon';

export function UnfiledScreen({
  onBack,
  onOpenTask,
}: {
  onBack: () => void;
  onOpenTask: () => void;
}) {
  const { c, t, display, ui, rtl } = useTheme();
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const { unfiled, complete, edit, remove } = useStore();

  const swipeActions = [
    { name: 'complete', label: t.done },
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

        {unfiled.length === 0 ? (
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
                onSnooze={() => edit(k.id, { dueDate: startOfDay(addDays(Date.now(), 1)) })}
                onDelete={() => remove(k.id)}
                onLongPress={onOpenTask}
              >
                <TaskRow
                  title={rowTitle(k, t)}
                  done={done}
                  onToggle={() => complete(k.id, !done)}
                  accessibilityActions={swipeActions}
                  onAccessibilityAction={(e) => {
                    const action = e.nativeEvent.actionName;
                    if (action === 'complete') complete(k.id, !done);
                    if (action === 'snooze') edit(k.id, { dueDate: startOfDay(addDays(Date.now(), 1)) });
                    if (action === 'delete') remove(k.id);
                  }}
                />
              </SwipeableRow>
            );
          })}

          <EmptyRules count={unfiled.length ? 4 : 2} />
        </Ledger>
      </ScrollView>
    </Screen>
  );
}
