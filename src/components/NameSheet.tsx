import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { Sheet, SheetButton } from './Sheet';

export function NameSheet({
  initial,
  placeholder,
  onClose,
  onSubmit,
}: {
  initial: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const { c, t, display, rtl, reduced } = useTheme();
  const [text, setText] = useState(initial);

  const submit = () => {
    onSubmit(text.trim());
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <View style={{ paddingTop: 14, paddingHorizontal: metrics.gutter, gap: 16 }}>
        <View style={{ borderBottomWidth: 1.5, borderBottomColor: c.ink, paddingBottom: 10 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            autoFocus={!reduced}
            placeholder={placeholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={placeholder}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            returnKeyType="done"
            onSubmitEditing={submit}
            style={[
              display(22, { lineHeight: 28 }),
              { color: c.ink, padding: 0, textAlign: align(rtl) },
            ]}
          />
        </View>

        <View style={{ flexDirection: row(rtl), gap: 12 }}>
          <SheetButton secondary label={t.cancel} onPress={onClose} />
          <SheetButton label={t.save} onPress={submit} />
        </View>
      </View>
    </Sheet>
  );
}
