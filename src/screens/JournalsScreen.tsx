import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { Palette } from '../theme/palette';
import { useJournals, useStore } from '../state/store';
import { DEFAULT_JOURNAL_ID } from '../data/seed';
import {
  ChevronBackIcon,
  CheckIcon,
  CloseIcon,
  JournalIcon,
  JournalIconKey,
  JOURNAL_ICON_KEYS,
  PenIcon,
} from '../components/Icon';
import { AddRow, Ledger } from '../components/Ledger';
import { Screen, useHeaderTop } from '../components/Screen';

const colorKeys = ['blue', 'och', 'moss', 'ver'] as const;

type Editing = { id: string | null };

export function JournalsScreen({ onBack }: { onBack: () => void }) {
  const { c, t, display, rtl } = useTheme();
  const top = useHeaderTop();
  const journals = useJournals();
  const { currentJournalId, setCurrentJournal, addJournal, updateJournal, removeJournal } =
    useStore();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const colorLabels: Record<(typeof colorKeys)[number], string> = {
    blue: t.blue,
    och: t.ochre,
    moss: t.green,
    ver: t.red,
  };

  const target = editing?.id ? journals.find((j) => j.id === editing.id) : undefined;

  const onSave = (patch: { name: string; color: keyof Palette; icon: JournalIconKey }) => {
    if (editing?.id) updateJournal(editing.id, patch);
    else addJournal(patch);
    setEditing(null);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.tabBar }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: metrics.gutter,
            paddingBottom: 12,
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Pressable
            onPress={onBack}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            hitSlop={metrics.hitSlop}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronBackIcon size={24} color={c.ink} flip={rtl} />
          </Pressable>
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(28), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
          >
            {t.journals}
          </Text>
        </View>

        <Ledger>
          {journals.map((j) => {
            const isDefault = j.id === DEFAULT_JOURNAL_ID;
            const isCurrent = j.id === currentJournalId;
            return (
              <View
                key={j.id}
                style={[
                  {
                    height: metrics.row,
                    flexDirection: row(rtl),
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: c.rule,
                  },
                  pad(rtl, 16, metrics.gutter),
                ]}
              >
                <Pressable
                  onPress={() => setCurrentJournal(j.id)}
                  android_ripple={null}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCurrent }}
                  accessibilityLabel={j.name}
                  accessibilityHint={t.switchJournal}
                  style={{ flex: 1, flexDirection: row(rtl), alignItems: 'center' }}
                >
                  <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
                    <JournalIcon name={j.icon} size={20} color={c[j.color]} />
                  </View>
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={maxFontSizeMultiplier}
                    style={[
                      display(17, { weight: 400 }),
                      { flex: 1, color: c.ink, textAlign: align(rtl) },
                      marginStart(rtl, 14),
                    ]}
                  >
                    {j.name}
                  </Text>
                  {isCurrent ? (
                    <View style={marginStart(rtl, 10)}>
                      <CheckIcon width={14} height={12} color={c.ink} />
                    </View>
                  ) : null}
                </Pressable>

                {isDefault ? null : confirming === j.id ? (
                  <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
                    <Pressable
                      onPress={() => setConfirming(null)}
                      android_ripple={null}
                      accessibilityRole="button"
                      accessibilityLabel={t.cancel}
                      style={{
                        height: 44,
                        minWidth: 44,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={[display(15, { weight: 400 }), { color: c.ink3 }]}>
                        {t.cancel}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        removeJournal(j.id);
                        setConfirming(null);
                      }}
                      android_ripple={null}
                      accessibilityRole="button"
                      accessibilityLabel={t.deleteJournal}
                      style={{
                        height: 44,
                        minWidth: 44,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={[display(15, { weight: 500 }), { color: c.ver }]}>
                        {t.delete}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
                    <Pressable
                      onPress={() => {
                        setConfirming(null);
                        setEditing({ id: j.id });
                      }}
                      android_ripple={null}
                      accessibilityRole="button"
                      accessibilityLabel={t.editJournal}
                      style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PenIcon size={20} color={c.ink3} />
                    </Pressable>
                    <Pressable
                      onPress={() => setConfirming(j.id)}
                      android_ripple={null}
                      accessibilityRole="button"
                      accessibilityLabel={t.deleteJournal}
                      style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CloseIcon size={18} color={c.ink3} />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          <AddRow
            label={t.newJournal}
            onPress={() => {
              setConfirming(null);
              setEditing({ id: null });
            }}
          />
        </Ledger>

        {editing ? (
          <JournalForm
            key={editing.id ?? 'new'}
            initialName={target?.name ?? ''}
            initialColor={target?.color ?? 'blue'}
            initialIcon={target?.icon ?? 'book'}
            saveLabel={editing.id ? t.saveJournal : t.addJournal}
            colorLabels={colorLabels}
            onSave={onSave}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function JournalForm({
  initialName,
  initialColor,
  initialIcon,
  saveLabel,
  colorLabels,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialColor: keyof Palette;
  initialIcon: JournalIconKey;
  saveLabel: string;
  colorLabels: Record<(typeof colorKeys)[number], string>;
  onSave: (patch: { name: string; color: keyof Palette; icon: JournalIconKey }) => void;
  onCancel: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<keyof Palette>(initialColor);
  const [icon, setIcon] = useState<JournalIconKey>(initialIcon);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  return (
    <View
      style={{
        margin: metrics.gutter,
        padding: 16,
        borderWidth: 1,
        borderColor: c.rule,
        borderRadius: radius.card,
        backgroundColor: c.card,
      }}
    >
      <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
        {t.journalName}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t.journalPlaceholder}
        placeholderTextColor={c.ink3}
        selectionColor={c.ink}
        accessibilityLabel={t.journalName}
        style={[
          ui(17, 400, 24),
          {
            minHeight: 44,
            paddingVertical: 8,
            paddingHorizontal: 0,
            color: c.ink,
            borderBottomWidth: 1.5,
            borderBottomColor: c.ink,
            textAlign: align(rtl),
          },
        ]}
      />

      <Text
        style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl), marginTop: 16 }]}
      >
        {t.color}
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t.color}
        style={{ flexDirection: row(rtl) }}
      >
        {colorKeys.map((col) => {
          const on = col === color;
          return (
            <Pressable
              key={col}
              onPress={() => setColor(col)}
              android_ripple={null}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={colorLabels[col]}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
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

      <Text
        style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl), marginTop: 16 }]}
      >
        {t.journalIcon}
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t.journalIcon}
        style={{ flexDirection: row(rtl), flexWrap: 'wrap' }}
      >
        {JOURNAL_ICON_KEYS.map((key) => {
          const on = key === icon;
          return (
            <Pressable
              key={key}
              onPress={() => setIcon(key)}
              android_ripple={null}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${t.journalIcon}: ${key}`}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: radius.card,
                  borderWidth: 1.5,
                  borderColor: on ? c.ink : c.rule,
                  backgroundColor: on ? c.paper2 : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <JournalIcon name={key} size={22} color={c.ink} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: row(rtl), gap: 12, marginTop: 20 }}>
        <Pressable
          onPress={onCancel}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.cancel}
          style={{
            flex: 1,
            height: 48,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.rule,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[ui(17, 500), { lineHeight: undefined, color: c.ink2 }]}>{t.cancel}</Text>
        </Pressable>
        <Pressable
          onPress={() => canSave && onSave({ name: trimmed, color, icon })}
          disabled={!canSave}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          accessibilityLabel={saveLabel}
          style={{
            flex: 1,
            height: 48,
            borderRadius: radius.card,
            backgroundColor: c.ink,
            opacity: canSave ? 1 : 0.4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[ui(17, 500), { lineHeight: undefined, color: c.paper }]}>{saveLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
