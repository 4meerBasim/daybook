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
import { align, borderStart, row } from '../lib/rtl';
import { useProjects, useStore } from '../state/store';
import { ListKey, Priority, Status } from '../data/seed';
import { chipColors, parse, tokenColor } from '../lib/parse';

const priorities: Priority[] = ['none', 'low', 'medium', 'high'];
const statuses: Status[] = ['todo', 'doing', 'waiting'];

type SheetInput = React.ComponentRef<typeof BottomSheetTextInput>;

export type AddKind = 'task' | 'habit' | 'project';

const kinds: AddKind[] = ['task', 'habit', 'project'];
const projectColors = ['blue', 'och', 'moss', 'ver'] as const;

export function QuickAddSheet({
  initialKind = 'task',
  initialProjectId = null,
  undatedList = 'inbox',
  onClose,
}: {
  initialKind?: AddKind;
  initialProjectId?: string | null;
  undatedList?: ListKey;
  onClose: () => void;
}) {
  const { c, t, ar, ui, mono, display, rtl, reduced } = useTheme();
  const { qa, setQa, addTask, addHabit, addProject } = useStore();
  const allProjects = useProjects();
  const [kind, setKind] = useState(initialKind);
  const [name, setName] = useState('');
  const [color, setColor] = useState<(typeof projectColors)[number]>('blue');
  const [minutes, setMinutes] = useState('');
  const [when, setWhen] = useState('');
  const [desc, setDesc] = useState('');
  const [pickedPriority, setPickedPriority] = useState<Priority | null>(null);
  const [status, setStatus] = useState<Status>('todo');
  const [projectId, setProjectId] = useState(initialProjectId);
  const sheetRef = useRef<BottomSheet>(null);
  const minutesRef = useRef<SheetInput>(null);
  const topInset = useSafeAreaInsets().top;

  const parsed = parse(qa, ar);
  const whenParsed = parse(when, ar);
  const freeWhen = whenParsed.tokens
    .filter((tk) => tk.kind === 'plain')
    .map((tk) => tk.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const chips = [...whenParsed.chips, ...parsed.chips].filter(
    (ch, i, all) => all.findIndex((o) => o.kind === ch.kind && o.label === ch.label) === i
  );
  const whenDated =
    !!freeWhen || whenParsed.chips.some((ch) => ch.kind === 'date' || ch.kind === 'time');
  const list: ListKey = parsed.hasDate || whenDated ? 'today' : undatedList;
  const dest = {
    today: ar ? 'يُحفظ في اليوم' : 'Saved to Today',
    inbox: ar ? 'يُحفظ في الوارد' : 'Saved to Inbox',
  }[list];
  const priority =
    pickedPriority ?? (chips.some((ch) => ch.kind === 'pri') ? 'high' : 'none');

  const kindLabels = {
    task: t.kindTask,
    habit: t.kindHabit,
    project: t.kindProject,
  };
  const addLabel = {
    task: t.addTask,
    habit: t.addHabit,
    project: t.addProject,
  }[kind];
  const colorLabels = { blue: t.blue, och: t.ochre, moss: t.green, ver: t.red };

  const submit = () => {
    if (kind !== 'task') {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (kind === 'habit') addHabit(trimmed, Math.min(Number(minutes) || 0, 1440));
      if (kind === 'project') addProject({ name: trimmed, color });
      sheetRef.current?.forceClose();
      return;
    }
    const plain = parsed.tokens
      .filter((tk) => tk.kind === 'plain')
      .map((tk) => tk.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const title = plain || qa.trim();
    if (!title) return;
    const meta = chips
      .filter((ch) => ch.kind !== 'tag' && ch.kind !== 'pri' && ch.label !== t.today)
      .map((ch) => ch.label);
    if (freeWhen) meta.push(freeWhen);
    addTask({
      title,
      meta: meta.join(' · '),
      list,
      projectId,
      later: parsed.hasLaterDay || whenParsed.hasLaterDay || !!freeWhen,
      desc: desc.trim(),
      priority,
      status,
    });
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
        contentContainerStyle={{
          paddingTop: 14,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
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

        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t.addWhat}
          style={{
            flexDirection: row(rtl),
            borderWidth: 1,
            borderColor: c.rule,
            borderRadius: radius.card,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          {kinds.map((k, i) => {
            const on = k === kind;
            return (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                android_ripple={null}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={kindLabels[k]}
                style={[
                  {
                    flex: 1,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? c.ink : 'transparent',
                  },
                  i === 0 ? null : borderStart(rtl, 1, c.rule),
                ]}
              >
                <Text
                  style={[ui(15, 500), { lineHeight: undefined, color: on ? c.paper : c.ink2 }]}
                >
                  {kindLabels[k]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {kind === 'task' ? null : (
          <BottomSheetTextInput
            autoFocus={!reduced}
            value={name}
            onChangeText={setName}
            placeholder={kind === 'habit' ? t.habitPlaceholder : t.projectPlaceholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={kind === 'habit' ? t.newHabit : t.newProject}
            multiline={false}
            returnKeyType={kind === 'habit' ? 'next' : 'done'}
            onSubmitEditing={kind === 'habit' ? () => minutesRef.current?.focus() : submit}
            submitBehavior="submit"
            style={[
              lineStyle,
              {
                padding: 0,
                paddingBottom: 12,
                borderBottomWidth: 1.5,
                borderBottomColor: c.ink,
                textAlign: align(rtl),
              },
            ]}
          />
        )}

        {kind === 'habit' ? (
          <DetailInput
            label={t.habitTime}
            value={minutes}
            onChangeText={(v) =>
              setMinutes(
                v
                  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
                  .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
                  .replace(/[^0-9]/g, '')
              )
            }
            placeholder={t.habitTimePlaceholder}
            keyboardType="number-pad"
            maxLength={4}
            inputRef={minutesRef}
          />
        ) : null}

        {kind === 'project' ? (
          <View style={{ marginTop: 12 }}>
            <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.color}
            </Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t.color}
              style={{ flexDirection: row(rtl) }}
            >
              {projectColors.map((col) => {
                const on = col === color;
                return (
                  <Pressable
                    key={col}
                    onPress={() => setColor(col)}
                    android_ripple={null}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={colorLabels[col]}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: radius.pen,
                        borderWidth: 2,
                        borderColor: on ? c.ink : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: radius.pen,
                          backgroundColor: c[col],
                        }}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {kind === 'task' ? (
          <>
            <View
              style={{
                borderBottomWidth: 1.5,
                borderBottomColor: c.ink,
                paddingBottom: 10,
              }}
            >
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
              {chips
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

            <DetailInput
              label={t.when}
              value={when}
              onChangeText={setWhen}
              placeholder={t.whenPlaceholder}
              onSubmitEditing={submit}
            />
            <DetailInput
              label={t.description}
              value={desc}
              onChangeText={setDesc}
              placeholder={t.descPlaceholder}
              multiline
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
                ...allProjects.map((p) => ({
                  key: p.id as string | null,
                  label: p.name,
                })),
              ]}
              value={projectId}
              onChange={setProjectId}
            />
          </>
        ) : null}

        <Pressable
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          android_ripple={null}
          style={{
            height: 48,
            marginTop: 16,
            borderRadius: radius.card,
            backgroundColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[ui(17, 500), { lineHeight: undefined, color: c.paper }]}>{addLabel}</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function DetailInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  maxLength,
  onSubmitEditing,
  inputRef,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'number-pad';
  maxLength?: number;
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<SheetInput | null>;
}) {
  const { c, ui, mono, rtl } = useTheme();
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>{label}</Text>
      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.ink3}
        selectionColor={c.ink}
        accessibilityLabel={label}
        ref={inputRef}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        submitBehavior={onSubmitEditing ? 'submit' : undefined}
        returnKeyType={onSubmitEditing ? 'done' : undefined}
        style={[
          ui(15, 400, 22),
          {
            minHeight: 44,
            maxHeight: 82,
            paddingVertical: 8,
            paddingHorizontal: 0,
            color: c.ink,
            borderBottomWidth: 1,
            borderBottomColor: c.rule,
            textAlign: align(rtl),
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
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
      <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
        {label}
      </Text>
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
              style={{
                height: 44,
                minWidth: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
                <Text
                  style={[ui(12, 500), { lineHeight: undefined, color: on ? c.paper : c.ink2 }]}
                >
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
