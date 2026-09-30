import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { matches } from '../lib/matches';
import { useProjects, useStore, useTasks } from '../state/store';
import { ListKey } from '../data/seed';
import { Palette } from '../theme/palette';
import { AddRow, Dot, SectionLabel } from './Ledger';
import { ChevronBackIcon } from './Icon';

type Entry = { id: string | null; name: string; color: keyof Palette };

export function ProjectRows({
  list,
  query,
  onOpen,
  onAdd,
}: {
  list: ListKey;
  query: string;
  onOpen: (projectId: string | null) => void;
  onAdd: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { done } = useStore();
  const inList = useTasks().filter((k) => k.list === list);
  const searching = query.trim() !== '';

  const entries: Entry[] = [...useProjects(), { id: null, name: t.noProject, color: 'ink3' }];
  const visible = entries
    .map((p) => ({ ...p, items: inList.filter((k) => k.projectId === p.id) }))
    .filter((p) => p.id !== null || p.items.length > 0)
    .filter(
      (p) =>
        !searching || matches(p.name, query) || p.items.some((k) => matches(k.title, query))
    );

  return (
    <>
      {visible.map((p) => {
        const doneN = p.items.filter((k) => done[k.id]).length;
        const total = p.items.length;
        return (
          <Pressable
            key={p.id ?? 'none'}
            onPress={() => onOpen(p.id)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={total ? `${p.name}, ${doneN} ${t.of} ${total}` : p.name}
            style={({ pressed }) => [
              {
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
                backgroundColor: pressed ? c.paper2 : 'transparent',
              },
              pad(rtl, 16, metrics.gutter),
            ]}
          >
            <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
              <Dot color={c[p.color]} size={8} />
            </View>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                ui(17, 400, 22),
                { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
                marginStart(rtl, 16),
              ]}
            >
              {p.name}
            </Text>
            {total ? (
              <Text style={[mono(12, 500), { color: c.ink3 }]}>{`${doneN}/${total}`}</Text>
            ) : null}
            <ChevronBackIcon size={16} color={c.ink3} flip={!rtl} />
          </Pressable>
        );
      })}

      {searching && visible.length === 0 ? <SectionLabel label={t.noMatches} /> : null}

      {searching ? null : <AddRow label={t.newProject} onPress={onAdd} />}
    </>
  );
}
