import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { matches } from '../lib/matches';
import { useStore, useTasks } from '../state/store';
import { ListKey, projects } from '../data/seed';
import { Palette } from '../theme/palette';
import { Dot, SectionLabel } from './Ledger';
import { ChevronBackIcon } from './Icon';

type Entry = { id: string | null; name: string; color: keyof Palette };

export function ProjectRows({
  list,
  query,
  onOpen,
}: {
  list: ListKey;
  query: string;
  onOpen: (projectId: string | null) => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { done } = useStore();
  const inList = useTasks().filter((k) => k.list === list);

  const entries: Entry[] = [...projects(t), { id: null, name: t.noProject, color: 'ink3' }];
  const visible = entries
    .map((p) => ({ ...p, items: inList.filter((k) => k.projectId === p.id) }))
    .filter(
      (p) =>
        p.items.length > 0 &&
        (matches(p.name, query) || p.items.some((k) => matches(k.title, query)))
    );

  if (visible.length === 0) {
    return query.trim() ? <SectionLabel label={t.noMatches} /> : null;
  }

  return (
    <>
      {visible.map((p) => {
        const doneN = p.items.filter((k) => done[k.id]).length;
        const count = `${doneN}/${p.items.length}`;
        return (
          <Pressable
            key={p.id ?? 'none'}
            onPress={() => onOpen(p.id)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={`${p.name}, ${doneN} ${t.of} ${p.items.length}`}
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
            <Text style={[mono(12, 500), { color: c.ink3 }]}>{count}</Text>
            <ChevronBackIcon size={16} color={c.ink3} flip={!rtl} />
          </Pressable>
        );
      })}
    </>
  );
}
