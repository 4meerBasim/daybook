import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { addDays, longDate, startOfDay } from '../lib/date';
import { rowTitle, type TaskRow } from '../db/schema';
import { Segmented } from './Segmented';
import { Sheet, SheetButton } from './Sheet';

const NUDGE_DAYS = [1, 3, 7] as const;

export function WaitingSheet({
  task,
  onClose,
  onSubmit,
  onClear,
}: {
  task: TaskRow;
  onClose: () => void;
  onSubmit: (blockedBy: string, nudgeAt: number) => void;
  onClear: () => void;
}) {
  const { c, t, ui, mono, display, rtl, reduced } = useTheme();
  const [who, setWho] = useState(task.blockedBy ?? '');
  const [days, setDays] = useState<string>('3');

  const nudge = startOfDay(addDays(Date.now(), Number(days)));
  const name = who.trim();

  const submit = () => {
    if (!name) return;
    onSubmit(name, nudge);
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <View style={{ paddingTop: 14, paddingHorizontal: metrics.gutter, gap: 16 }}>
        <View>
          <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {t.waitingOn}
          </Text>
          <Text
            numberOfLines={2}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(22), { color: c.ink, textAlign: align(rtl) }]}
          >
            {rowTitle(task, t)}
          </Text>
        </View>

        <View style={{ borderBottomWidth: 1.5, borderBottomColor: c.ink, paddingBottom: 10 }}>
          <TextInput
            value={who}
            onChangeText={setWho}
            autoFocus={!reduced}
            placeholder={t.whoIsBlocking}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.whoIsBlocking}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            returnKeyType="done"
            onSubmitEditing={submit}
            style={[
              display(22, { lineHeight: 28 }),
              { color: c.ink, padding: 0, textAlign: align(rtl) },
            ]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {t.nudgeOn}
          </Text>
          <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 12 }}>
            <Segmented
              options={NUDGE_DAYS.map((d) => ({
                key: String(d),
                label: t.inDays.replace('{n}', String(d)),
              }))}
              value={days}
              onChange={setDays}
            />
            <Text numberOfLines={1} style={[ui(13), { flex: 1, color: c.ink3 }]}>
              {longDate(nudge, t)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: row(rtl), gap: 12 }}>
          {task.blockedBy ? (
            <SheetButton
              secondary
              label={t.notWaiting}
              onPress={() => {
                onClear();
                onClose();
              }}
            />
          ) : (
            <SheetButton secondary label={t.cancel} onPress={onClose} />
          )}
          <SheetButton label={t.save} onPress={submit} />
        </View>
      </View>
    </Sheet>
  );
}
