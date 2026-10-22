import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { chipColors, draft, parse, tokenColor } from '../lib/parse';
import { PRIORITY_HIGH } from '../db/schema';
import { Chip } from '../components/Chip';
import { CalendarIcon, FlagIcon, HashIcon, PaperclipIcon } from '../components/Icon';

// @gorhom/bottom-sheet 5.2.14 blurs through TextInput.State.currentlyFocusedInput(), which
// react-native-web does not implement — it exposes currentlyFocusedField() instead
const inputState = TextInput.State as unknown as {
  currentlyFocusedInput?: () => unknown;
  currentlyFocusedField?: () => unknown;
};
inputState.currentlyFocusedInput ??= () => inputState.currentlyFocusedField?.() ?? null;

const LINE = 28;

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c, t, ar, ui, display, rtl, reduced } = useTheme();
  const { qa, setQa, create } = useStore();
  const sheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);

  useEffect(() => {
    if (!open) {
      sheetRef.current?.close();
      return;
    }
    sheetRef.current?.expand();
    if (!reduced) inputRef.current?.focus();
  }, [open, reduced]);

  const parsed = parse(qa, ar);
  const dest = parsed.hasDate
    ? ar
      ? 'يُحفظ في القادم'
      : 'Saved to Upcoming'
    : ar
      ? 'بلا تاريخ'
      : 'No date';

  const onAdd = () => {
    const { title, tags, dueDate, high } = draft(parsed, Date.now());
    if (title) create({ title, tags, dueDate, priority: high ? PRIORITY_HIGH : null });
    setQa('');
    onClose();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.28}
        style={[props.style, { backgroundColor: c.ink }]}
        pressBehavior="close"
      />
    ),
    [c.ink]
  );

  const field = display(22, { lineHeight: LINE });
  const lineStyle = [field, { padding: 0, textAlign: align(rtl) } as const];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose
      onClose={onClose}
      animateOnMount={!reduced}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      backgroundStyle={{
        backgroundColor: c.card,
        borderTopLeftRadius: radius.sheet,
        borderTopRightRadius: radius.sheet,
        borderTopWidth: 1,
        borderTopColor: c.rule,
      }}
    >
      <BottomSheetView style={{ paddingTop: 14, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: c.rule,
            alignSelf: 'center',
            marginBottom: 14,
          }}
        />

        <View style={{ borderBottomWidth: 1.5, borderBottomColor: c.ink, paddingBottom: 10 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[lineStyle, { minHeight: field.lineHeight, color: c.ink }]}
          >
            {parsed.tokens.map((tk, i) => (
              <Text
                key={i}
                style={{
                  color: tokenColor(tk.kind, c),
                  textDecorationLine: tk.kind === 'plain' ? 'none' : 'underline',
                  textDecorationColor: tokenColor(tk.kind, c),
                }}
              >
                {tk.text}
              </Text>
            ))}
          </Text>
          <BottomSheetTextInput
            ref={inputRef}
            value={qa}
            onChangeText={setQa}
            placeholder={t.placeholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.newTask}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            style={[lineStyle, StyleSheet.absoluteFill, { color: 'transparent' }]}
          />
        </View>

        <View
          style={{
            flexDirection: row(rtl),
            gap: 8,
            marginTop: 12,
            flexWrap: 'wrap',
            minHeight: 28,
          }}
        >
          {parsed.chips.map((ch, i) => {
            const col = chipColors(ch.kind, c);
            return <Chip key={i} label={ch.label} bg={col.bg} fg={col.fg} height={28} />;
          })}
          <Chip label={dest} dashed height={28} />
        </View>

        <View
          style={{
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
          }}
        >
          <View
            style={{ flexDirection: row(rtl), gap: 18 }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <CalendarIcon size={22} color={c.ink2} />
            <FlagIcon size={22} color={c.ink2} />
            <HashIcon size={22} color={c.ink2} />
            <PaperclipIcon size={22} color={c.ink2} />
          </View>
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel={t.add}
            android_ripple={null}
            style={{
              height: 40,
              paddingHorizontal: 18,
              borderRadius: radius.card,
              backgroundColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[ui(15, 500), { lineHeight: undefined, color: c.paper }]}>{t.add}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
