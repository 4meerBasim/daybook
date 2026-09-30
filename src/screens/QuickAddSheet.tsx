import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { ListKey, projects } from '../data/seed';
import { chipColors, parse, tokenColor } from '../lib/parse';
import { CalendarIcon, FlagIcon, HashIcon, PaperclipIcon } from '../components/Icon';

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c, t, ar, ui, display, rtl, reduced } = useTheme();
  const { qa, setQa, addTask } = useStore();
  const [projectId, setProjectId] = useState<string | null>(null);
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
  const list: ListKey = parsed.hasDate ? 'today' : 'inbox';
  const dest = {
    today: ar ? 'يُحفظ في اليوم' : 'Saved to Today',
    inbox: ar ? 'يُحفظ في الوارد' : 'Saved to Inbox',
  }[list];

  const projectChoices = [{ id: null as string | null, name: t.noProject }, ...projects(t)];

  const submit = () => {
    const plain = parsed.tokens
      .filter((tk) => tk.kind === 'plain')
      .map((tk) => tk.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const title = plain || qa.trim();
    if (title) {
      const when = parsed.chips
        .filter((ch) => ch.kind !== 'tag' && ch.kind !== 'pri' && ch.label !== t.today)
        .map((ch) => ch.label);
      addTask({ title, meta: when.join(' · '), list, projectId, later: parsed.hasLaterDay });
      setQa('');
      setProjectId(null);
    }
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

  const lineStyle = [display(22, { lineHeight: 28 }), { color: c.ink }];

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
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Text style={[lineStyle, { color: c.ink, textAlign: align(rtl) }]}>
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
          </View>
          <BottomSheetTextInput
            ref={inputRef}
            value={qa}
            onChangeText={setQa}
            placeholder={t.placeholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.newTask}
            multiline={false}
            onSubmitEditing={submit}
            style={[lineStyle, { color: 'transparent', padding: 0, textAlign: align(rtl) }]}
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
            return (
              <View
                key={i}
                style={{
                  height: 28,
                  paddingHorizontal: 10,
                  borderRadius: radius.chip,
                  backgroundColor: col.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[ui(12, 500), { lineHeight: undefined, color: col.fg }]}>{ch.label}</Text>
              </View>
            );
          })}
          <View
            style={{
              height: 28,
              paddingHorizontal: 10,
              borderRadius: radius.chip,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: c.rule,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[ui(12, 500), { lineHeight: undefined, color: c.ink3 }]}>{dest}</Text>
          </View>
        </View>

        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t.project}
          style={{ flexDirection: row(rtl), gap: 8, marginTop: 4, flexWrap: 'wrap' }}
        >
          {projectChoices.map((p) => {
            const on = p.id === projectId;
            return (
              <Pressable
                key={p.id ?? 'none'}
                onPress={() => setProjectId(p.id)}
                android_ripple={null}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={p.name}
                style={{ height: 44, justifyContent: 'center' }}
              >
                <View
                  style={{
                    height: 28,
                    paddingHorizontal: 12,
                    borderRadius: radius.chip,
                    backgroundColor: on ? c.ink : 'transparent',
                    borderWidth: 1,
                    borderColor: on ? c.ink : c.rule,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[ui(12, 500), { lineHeight: undefined, color: on ? c.paper : c.ink2 }]}>
                    {p.name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
            onPress={submit}
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
