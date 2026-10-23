import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { rowTitle, type TaskRow } from '../db/schema';
import { Sheet, SheetButton } from './Sheet';

export function EscapeSheet({
  task,
  onDoIt,
  onEscape,
}: {
  task: TaskRow;
  onDoIt: () => void;
  onEscape: (reason: string) => void;
}) {
  const { c, t, mono, display, rtl, reduced } = useTheme();
  const [reason, setReason] = useState('');
  const written = reason.trim();

  return (
    <Sheet onClose={onDoIt}>
      <View style={{ paddingTop: 14, paddingHorizontal: metrics.gutter, gap: 16 }}>
        <View>
          <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {t.insistentLabel}
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
            value={reason}
            onChangeText={setReason}
            autoFocus={!reduced}
            placeholder={t.whyEscaping}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.whyEscaping}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            returnKeyType="done"
            onSubmitEditing={() => written && onEscape(written)}
            style={[
              display(22, { lineHeight: 28 }),
              { color: c.ink, padding: 0, textAlign: align(rtl) },
            ]}
          />
        </View>

        <View style={{ flexDirection: row(rtl), gap: 12 }}>
          <SheetButton secondary label={t.doIt} onPress={onDoIt} />
          <SheetButton
            label={written ? t.escapeIt : t.oneLineFirst}
            onPress={() => written && onEscape(written)}
          />
        </View>
      </View>
    </Sheet>
  );
}
