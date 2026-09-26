import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, insetStart, marginStart, row } from '../lib/rtl';
import { dayOfMonth, timeLabel } from '../lib/date';
import { useStore } from '../state/store';
import { rowTitle, type TaskRow } from '../db/schema';
import { Screen, useHeaderTop } from '../components/Screen';
import { Ledger, SectionLabel, EmptyRules, rowContent, useRuling } from '../components/Ledger';
import { Chip } from '../components/Chip';
import { CheckIcon } from '../components/Icon';

function Avatar({ initials, bg, first }: { initials: string; bg: string; first: boolean }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={[
        {
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: c.paper,
          alignItems: 'center',
          justifyContent: 'center',
        },
        first ? undefined : marginStart(rtl, -8),
      ]}
    >
      <Text style={[mono(11, 500), { color: c.paper }]}>{initials}</Text>
    </View>
  );
}

type ProjectItem = { title: string; meta: string; done: boolean };

function ProjectRow({ item }: { item: ProjectItem }) {
  const { c, ui, mono, rtl } = useTheme();
  const { height, grown, onContentLayout } = useRuling();
  const [textWidth, setTextWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width);

  return (
    <View
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <View
          style={{
            width: metrics.checkbox,
            height: metrics.checkbox,
            borderWidth: 1.5,
            borderColor: c.ink,
            borderRadius: 4,
            backgroundColor: item.done ? c.ink : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.done ? <CheckIcon color={c.paper} /> : null}
        </View>

        <View style={[{ flex: 1, minWidth: 0, position: 'relative' }, marginStart(rtl, 16)]}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            onLayout={onLayout}
            style={[
              ui(17, 400, 22),
              { color: item.done ? c.ink3 : c.ink, textAlign: align(rtl) },
              item.done && grown ? { textDecorationLine: 'line-through' } : null,
            ]}
          >
            {item.title}
          </Text>
          {item.done && !grown ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: '50%',
                height: 1.5,
                width: textWidth + 2,
                backgroundColor: c.ink,
                ...insetStart(rtl, -2),
              }}
            />
          ) : null}
        </View>

        <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
          {item.meta}
        </Text>
      </View>
    </View>
  );
}

function rowMeta(task: TaskRow): string {
  if (task.dueDate === null) return '';
  return timeLabel(task.dueDate) || String(dayOfMonth(task.dueDate));
}

export function ProjectScreen() {
  const { c, t, display, ui, mono, rtl } = useTheme();
  const { project } = useStore();
  const top = useHeaderTop();
  const doneCount = project.filter((k) => k.completedAt !== null).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.gutter }}>
      <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, gap: 6 }}>
        <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.blue }} />
          <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>{t.project}</Text>
        </View>

        <View style={{ flexDirection: row(rtl), alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.studio}
          </Text>
          <Text style={[mono(22, 500), { color: c.ink2, paddingBottom: 4 }]}>
            <Text style={{ color: c.ink }}>{doneCount}</Text> / {project.length}
          </Text>
        </View>

        <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 12 }}>
          <View style={{ flexDirection: row(rtl) }}>
            <Avatar initials="LM" bg={c.ink} first />
            <Avatar initials="NA" bg={c.moss} first={false} />
          </View>
          <Text style={[ui(13), { color: c.ink3 }]}>{t.shared}</Text>
          <View style={{ flex: 1 }} />
          <Chip label="#design" bg={c.blueS} fg={c.blue} />
          <Chip label="#invoice" bg={c.ochS} fg={c.och} />
        </View>
      </View>

      <Ledger>
        <SectionLabel label={t.thisWeek} />
        {project.map((k) => (
          <ProjectRow
            key={k.id}
            item={{ title: rowTitle(k, t), meta: rowMeta(k), done: k.completedAt !== null }}
          />
        ))}
        <SectionLabel label={`${t.later} · 5`} />
        <EmptyRules count={3} />
      </Ledger>
      </ScrollView>
    </Screen>
  );
}
