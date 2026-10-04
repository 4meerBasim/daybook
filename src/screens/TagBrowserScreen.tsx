import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, priorityColors } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { collectTags, hasTag } from '../lib/matches';
import { useStore, useTasks } from '../state/store';
import { Screen, useHeaderTop } from '../components/Screen';
import { Dot, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { ChevronBackIcon } from '../components/Icon';

type Nav = { navigate: (screen: string, params?: object) => void; goBack: () => void };

const depthOf = (node: string) => node.split('/').length;
const labelOf = (node: string) => node.split('/').slice(-1)[0];

export function TagBrowserScreen() {
  const { c, t, display, ui, rtl } = useTheme();
  const navigation = useNavigation() as unknown as Nav;
  const top = useHeaderTop();
  const { done } = useStore();
  const allTasks = useTasks();

  const nodes = useMemo(() => {
    const set = new Set<string>();
    for (const tag of collectTags(allTasks)) {
      const parts = tag.split('/');
      let path = '';
      for (const part of parts) {
        path = path ? `${path}/${part}` : part;
        set.add(path);
      }
    }
    return [...set].sort();
  }, [allTasks]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  const hasChildren = (node: string) => nodes.some((n) => n.startsWith(node + '/'));

  const isVisible = (node: string) => {
    const parts = node.split('/');
    let path = '';
    for (let i = 0; i < parts.length - 1; i++) {
      path = path ? `${path}/${parts[i]}` : parts[i];
      if (!expanded.has(path)) return false;
    }
    return true;
  };

  const toggleExpand = (node: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(node)) next.delete(node);
      else next.add(node);
      return next;
    });

  const renderHeader = (title: string, onBack: () => void) => (
    <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12, gap: 4 }}>
      <View style={{ flexDirection: row(rtl) }}>
        <Pressable
          onPress={onBack}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={selected ? t.allTags : t.back}
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

  if (selected) {
    const matched = allTasks.filter((k) => hasTag(k.tags, selected) && !done[k.id]);
    return (
      <Screen>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
          {renderHeader(`#${selected}`, () => setSelected(null))}
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
            {matched.length === 0 ? <SectionLabel label={t.noMatches} /> : null}
            <EmptyRules count={4} />
          </Ledger>
        </ScrollView>
      </Screen>
    );
  }

  const visible = nodes.filter(isVisible);

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
        {renderHeader(t.tagBrowser, () => navigation.goBack())}

        {nodes.length === 0 ? (
          <Ledger>
            <SectionLabel label={t.noTags} />
            <EmptyRules count={4} />
          </Ledger>
        ) : (
          <Ledger>
            {visible.map((node) => {
              const depth = depthOf(node);
              const expandable = hasChildren(node);
              const open = expanded.has(node);
              return (
                <View
                  key={node}
                  style={{
                    flexDirection: row(rtl),
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: c.rule,
                  }}
                >
                  {expandable ? (
                    <Pressable
                      onPress={() => toggleExpand(node)}
                      android_ripple={null}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: open }}
                      accessibilityLabel={labelOf(node)}
                      style={[
                        { width: 44, height: metrics.row, alignItems: 'center', justifyContent: 'center' },
                        { ...(rtl ? { marginRight: (depth - 1) * 16 } : { marginLeft: (depth - 1) * 16 }) },
                      ]}
                    >
                      <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
                        <ChevronBackIcon size={16} color={c.ink2} flip={!rtl} />
                      </View>
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        { width: 44, height: metrics.row, alignItems: 'center', justifyContent: 'center' },
                        { ...(rtl ? { marginRight: (depth - 1) * 16 } : { marginLeft: (depth - 1) * 16 }) },
                      ]}
                    >
                      <Dot color={c.ink3} size={6} />
                    </View>
                  )}

                  <Pressable
                    onPress={() => setSelected(node)}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={node}
                    accessibilityHint={t.filterByTag}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: metrics.row,
                        flexDirection: row(rtl),
                        alignItems: 'center',
                        backgroundColor: pressed ? c.paper2 : 'transparent',
                      },
                      pad(rtl, 4, metrics.gutter),
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={maxFontSizeMultiplier}
                      style={[ui(17, 400, 22), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
                    >
                      {labelOf(node)}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
            <EmptyRules count={3} />
          </Ledger>
        )}
      </ScrollView>
    </Screen>
  );
}
