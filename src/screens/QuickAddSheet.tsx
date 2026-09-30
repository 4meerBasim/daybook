import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { ListKey, Priority, projects, Status } from '../data/seed';
import { chipColors, parse, tokenColor } from '../lib/parse';
import { CalendarIcon, FlagIcon, HashIcon, PaperclipIcon } from '../components/Icon';

const priorities: Priority[] = ['none', 'low', 'medium', 'high'];
const statuses: Status[] = ['todo', 'doing', 'waiting'];

export function QuickAddSheet({
  initialProjectId = null,
  undatedList = 'inbox',
  onClose,
}: {
  initialProjectId?: string | null;
  undatedList?: ListKey;
  onClose: () => void;
}) {
  const { c, t, ar, ui, display, rtl, reduced } = useTheme();
  const { qa, setQa, addTask } = useStore();
  const [desc, setDesc] = useState('');
  const [pickedPriority, setPickedPriority] = useState<Priority | null>(null);
  const [status, setStatus] = useState<Status>('todo');
  const [projectId, setProjectId] = useState(initialProjectId);
  const sheetRef = useRef<BottomSheet>(null);
  const topInset = useSafeAreaInsets().top;

  const parsed = parse(qa, ar);
  const list: ListKey = parsed.hasDate ? 'today' : undatedList;
  const dest = {
    today: ar ? 'يُحفظ في اليوم' : 'Saved to Today',
    inbox: ar ? 'يُحفظ في الوارد' : 'Saved to Inbox',
  }[list];
  const priority =
    pickedPriority ?? (parsed.chips.some((ch) => ch.kind === 'pri') ? 'high' : 'none');

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
      addTask({
        title,
        meta: when.join(' · '),
        list,
        projectId,
        later: parsed.hasLaterDay,
        desc: desc.trim(),
        priority,
        status,
      });
      setQa('');
    }
    sheetRef.current?.forceClose();
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
      index={0}
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose
      onClose={() => {
        setQa('');
        onClose();
      }}
      topInset={topInset}
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
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 14, paddingHorizontal: 20, paddingBottom: 16 }}
      >
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
            autoFocus={!reduced}
            value={qa}
            onChangeText={setQa}
            placeholder={t.placeholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.newTask}
            multiline={false}
            onSubmitEditing={submit}
            submitBehavior="submit"
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
          {parsed.chips
            .filter((ch) => ch.kind !== 'pri')
            .map((ch, i) => {
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
                  <Text style={[ui(12, 500), { lineHeight: undefined, color: col.fg }]}>
                    {ch.label}
                  </Text>
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

        <BottomSheetTextInput
          value={desc}
          onChangeText={setDesc}
          placeholder={t.descPlaceholder}
          placeholderTextColor={c.ink3}
          selectionColor={c.ink}
          accessibilityLabel={t.description}
          multiline
          style={[
            ui(15, 400, 22),
            {
              minHeight: 44,
              maxHeight: 82,
              marginTop: 12,
              paddingVertical: 8,
              paddingHorizontal: 0,
              color: c.ink,
              borderBottomWidth: 1,
              borderBottomColor: c.rule,
              textAlign: align(rtl),
              textAlignVertical: 'top',
            },
          ]}
        />

        <ChoiceChips
          label={t.priority}
          options={priorities.map((p) => ({ key: p, label: t[p] }))}
          value={priority}
          onChange={setPickedPriority}
        />
        <ChoiceChips
          label={t.status}
          options={statuses.map((s) => ({ key: s, label: t[s] }))}
          value={status}
          onChange={setStatus}
        />
        <ChoiceChips
          label={t.project}
          options={[
            { key: null, label: t.noProject },
            ...projects(t).map((p) => ({ key: p.id as string | null, label: p.name })),
          ]}
          value={projectId}
          onChange={setProjectId}
        />

        <View
          style={{
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
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
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function ChoiceChips<T extends string | null>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  const { c, ui, mono, rtl } = useTheme();
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>{label}</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={{ flexDirection: row(rtl), gap: 8, flexWrap: 'wrap' }}
      >
        {options.map((o) => {
          const on = o.key === value;
          return (
            <Pressable
              key={o.key ?? 'none'}
              onPress={() => onChange(o.key)}
              android_ripple={null}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={o.label}
              style={{ height: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
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
                  {o.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
