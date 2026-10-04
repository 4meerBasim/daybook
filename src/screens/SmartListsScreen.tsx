import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { LABEL_COLORS, maxFontSizeMultiplier, metrics, priorityColors, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { collectTags } from '../lib/matches';
import { useProjects, useStore, useTasks } from '../state/store';
import { ColorKey, SmartList, SmartListRule } from '../data/seed';
import { builtinSmartLists, filterTasks } from '../lib/smartlists';
import { Screen, useHeaderTop } from '../components/Screen';
import { AddRow, Dot, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { ChevronBackIcon } from '../components/Icon';

type Nav = { navigate: (screen: string, params?: object) => void; goBack: () => void };

type DueValue = SmartListRule['due'] | undefined;
type PriorityValue = 'low' | 'medium' | 'high';

const COLOR_LABEL = {
  blue: 'blue',
  och: 'ochre',
  moss: 'green',
  ver: 'red',
} as const;

function Chip({
  label,
  selected,
  onPress,
  swatch,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  swatch?: string;
}) {
  const { c, ui, rtl } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{ height: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        style={{
          height: 32,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          borderRadius: radius.chip,
          borderWidth: 1,
          borderColor: selected ? c.ink : c.rule,
          backgroundColor: selected ? c.ink : 'transparent',
        }}
      >
        {swatch ? <Dot color={swatch} size={10} /> : null}
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[ui(13, 500), { lineHeight: undefined, color: selected ? c.paper : c.ink2 }]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function FieldLabel({ text }: { text: string }) {
  const { c, mono, rtl } = useTheme();
  return (
    <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl), marginTop: 4 }]}>
      {text}
    </Text>
  );
}

export function SmartListsScreen() {
  const { c, t, display, ui, rtl } = useTheme();
  const navigation = useNavigation() as unknown as Nav;
  const top = useHeaderTop();
  const { done, smartLists: userLists, addSmartList, updateSmartList, removeSmartList } = useStore();
  const allTasks = useTasks();
  const projects = useProjects();
  const allTags = useMemo(() => collectTags(allTasks), [allTasks]);

  const lists = useMemo<SmartList[]>(
    () => [...builtinSmartLists(t), ...userLists],
    [t, userLists]
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);

  const [name, setName] = useState('');
  const [eTags, setETags] = useState<string[]>([]);
  const [eDue, setEDue] = useState<DueValue>(undefined);
  const [ePriority, setEPriority] = useState<PriorityValue[]>([]);
  const [eColor, setEColor] = useState<ColorKey[]>([]);
  const [eProject, setEProject] = useState<string | null | undefined>(undefined);

  const isEditing = editingId !== undefined;
  const openList = openId ? lists.find((l) => l.id === openId) : undefined;

  const openEditor = (list?: SmartList) => {
    setEditingId(list ? list.id : null);
    setName(list?.name ?? '');
    setETags(list?.rules.tags ?? []);
    setEDue(list?.rules.due);
    setEPriority(list?.rules.priority ?? []);
    setEColor(list?.rules.color ?? []);
    setEProject(list ? list.rules.projectId : undefined);
  };

  const toggleIn = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const save = () => {
    const rules: SmartListRule = {};
    if (eTags.length) rules.tags = eTags;
    if (eDue) rules.due = eDue;
    if (ePriority.length) rules.priority = ePriority;
    if (eColor.length) rules.color = eColor;
    if (eProject !== undefined) rules.projectId = eProject;
    const finalName = name.trim() || t.smartList;
    if (editingId) updateSmartList(editingId, { name: finalName, rules });
    else addSmartList(finalName, rules);
    setEditingId(undefined);
  };

  const renderHeader = (title: string, onBack: () => void) => (
    <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12, gap: 4 }}>
      <View style={{ flexDirection: row(rtl) }}>
        <Pressable
          onPress={onBack}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.back}
          style={[{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, marginStart(rtl, -10)]}
        >
          <ChevronBackIcon color={c.ink} flip={rtl} />
        </Pressable>
      </View>
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[display(34, { lineHeight: 38 }), { color: c.ink, textAlign: align(rtl) }]}
      >
        {title}
      </Text>
    </View>
  );

  if (isEditing) {
    return (
      <Screen>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {renderHeader(editingId ? t.editSmartList : t.newSmartList, () => setEditingId(undefined))}

          <View style={{ paddingHorizontal: metrics.gutter, gap: 12 }}>
            <FieldLabel text={t.smartListName} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.smartListNamePlaceholder}
              placeholderTextColor={c.ink3}
              selectionColor={c.ink}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              accessibilityLabel={t.smartListName}
              style={[
                ui(17),
                {
                  color: c.ink,
                  textAlign: align(rtl),
                  borderBottomWidth: 1,
                  borderBottomColor: c.rule,
                  paddingVertical: 8,
                },
              ]}
            />

            {allTags.length ? (
              <>
                <FieldLabel text={t.matchTags} />
                <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
                  {allTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      selected={eTags.includes(tag)}
                      onPress={() => setETags((prev) => toggleIn(prev, tag))}
                    />
                  ))}
                </View>
              </>
            ) : null}

            <FieldLabel text={t.dueFilter} />
            <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
              {([
                [undefined, t.anyValue],
                ['today', t.dueToday],
                ['week', t.dueThisWeek],
                ['overdue', t.overdue],
                ['none', t.noDueDate],
              ] as [DueValue, string][]).map(([value, label]) => (
                <Chip
                  key={label}
                  label={label}
                  selected={eDue === value}
                  onPress={() => setEDue(value)}
                />
              ))}
            </View>

            <FieldLabel text={t.priority} />
            <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
              {(['low', 'medium', 'high'] as PriorityValue[]).map((p) => (
                <Chip
                  key={p}
                  label={t[p]}
                  selected={ePriority.includes(p)}
                  swatch={c[priorityColors[p].fg]}
                  onPress={() => setEPriority((prev) => toggleIn(prev, p))}
                />
              ))}
            </View>

            <FieldLabel text={t.colorLabel} />
            <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
              {LABEL_COLORS.map((ck) => (
                <Chip
                  key={ck}
                  label={t[COLOR_LABEL[ck]]}
                  selected={eColor.includes(ck)}
                  swatch={c[ck]}
                  onPress={() => setEColor((prev) => toggleIn(prev, ck))}
                />
              ))}
            </View>

            <FieldLabel text={t.project} />
            <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
              <Chip label={t.anyValue} selected={eProject === undefined} onPress={() => setEProject(undefined)} />
              {projects.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  selected={eProject === p.id}
                  swatch={c[p.color]}
                  onPress={() => setEProject(p.id)}
                />
              ))}
              <Chip label={t.noProject} selected={eProject === null} onPress={() => setEProject(null)} />
            </View>

            <View style={{ flexDirection: row(rtl), gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={save}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={t.saveSmartList}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: radius.card,
                  backgroundColor: c.ink,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[ui(15, 500), { lineHeight: undefined, color: c.paper }]}>{t.save}</Text>
              </Pressable>
              {editingId ? (
                <Pressable
                  onPress={() => {
                    removeSmartList(editingId);
                    setEditingId(undefined);
                    if (openId === editingId) setOpenId(null);
                  }}
                  android_ripple={null}
                  accessibilityRole="button"
                  accessibilityLabel={t.deleteSmartList}
                  style={{
                    height: 48,
                    paddingHorizontal: 20,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: c.ver,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[ui(15, 500), { lineHeight: undefined, color: c.ver }]}>{t.delete}</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setEditingId(undefined)}
                  android_ripple={null}
                  accessibilityRole="button"
                  accessibilityLabel={t.cancel}
                  style={{
                    height: 48,
                    paddingHorizontal: 20,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: c.rule,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[ui(15, 500), { lineHeight: undefined, color: c.ink2 }]}>{t.cancel}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (openList) {
    const matched = filterTasks(allTasks, openList.rules).filter((k) => !done[k.id]);
    return (
      <Screen>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
          {renderHeader(openList.name, () => setOpenId(null))}
          <Ledger>
            {matched.map((k) => (
              <TaskRow
                key={k.id}
                title={k.title}
                meta={[k.priority && k.priority !== 'none' ? t[k.priority] : '', k.meta]
                  .filter(Boolean)
                  .join(' · ')}
                dotColor={
                  k.priority && k.priority !== 'none' ? c[priorityColors[k.priority].fg] : undefined
                }
                done={false}
                overdue={k.over}
                onToggle={() => navigation.navigate('TaskDetail', { taskId: k.id })}
                accessibilityActions={[]}
                onAccessibilityAction={() => {}}
              />
            ))}
            {matched.length === 0 ? <SectionLabel label={t.emptySmartList} /> : null}
            <EmptyRules count={4} />
          </Ledger>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
        {renderHeader(t.smartLists, () => navigation.goBack())}
        <Ledger>
          {lists.map((list) => (
            <View
              key={list.id}
              style={{
                flexDirection: row(rtl),
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              }}
            >
              <Pressable
                onPress={() => setOpenId(list.id)}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={list.name}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    height: metrics.row,
                    flexDirection: row(rtl),
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: pressed ? c.paper2 : 'transparent',
                  },
                  pad(rtl, 16, list.builtin ? metrics.gutter : 0),
                ]}
              >
                <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
                  <Dot color={list.builtin ? c.ink3 : c.och} size={8} />
                </View>
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={maxFontSizeMultiplier}
                  style={[ui(17, 400, 22), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 16)]}
                >
                  {list.name}
                </Text>
                {list.builtin ? <ChevronBackIcon size={16} color={c.ink3} flip={!rtl} /> : null}
              </Pressable>
              {list.builtin ? null : (
                <Pressable
                  onPress={() => openEditor(list)}
                  android_ripple={null}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.editSmartList} · ${list.name}`}
                  style={[
                    { width: 44, height: metrics.row, alignItems: 'center', justifyContent: 'center' },
                    pad(rtl, 0, metrics.gutter - 12),
                  ]}
                >
                  <Text style={[ui(13, 500), { lineHeight: undefined, color: c.ink2 }]}>{t.edit}</Text>
                </Pressable>
              )}
            </View>
          ))}
          <AddRow label={t.newSmartList} onPress={() => openEditor()} />
          <EmptyRules count={3} />
        </Ledger>
      </ScrollView>
    </Screen>
  );
}
