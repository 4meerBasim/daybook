import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, insetStart, marginStart, pad, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { rowTitle, type SubtaskRow as SubtaskRowData } from '../db/schema';
import { Screen, useHeaderTop } from '../components/Screen';
import { Checkbox, rowContent, useRuling } from '../components/Ledger';
import { Chip } from '../components/Chip';
import { ChevronBackIcon, EllipsisIcon, PaperclipIcon } from '../components/Icon';

function SubtaskRow({ task, onToggle }: { task: SubtaskRowData; onToggle: () => void }) {
  const { c, t, ui, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  const checked = task.completedAt !== null;
  const label = rowTitle(task, t);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      android_ripple={null}
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <Checkbox checked={checked} />
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            ui(15, 400, 22),
            marginStart(rtl, 16),
            {
              flex: 1,
              minWidth: 0,
              color: checked ? c.ink3 : c.ink,
              textAlign: align(rtl),
              textDecorationLine: checked ? 'line-through' : 'none',
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function TaskDetailScreen({ onBack, onFocus }: { onBack: () => void; onFocus: () => void }) {
  const { c, t, ui, mono, display, rtl, unit } = useTheme();
  const { subtasks, completeSubtask } = useStore();
  const top = useHeaderTop();

  const doneCount = subtasks.filter((s) => s.completedAt !== null).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.gutter }}>
        <View
          style={{
            paddingTop: top + 40,
            paddingHorizontal: metrics.gutter,
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={onBack}
            hitSlop={metrics.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            android_ripple={null}
          >
            <ChevronBackIcon color={c.ink2} flip={rtl} />
          </Pressable>
          <Text style={[mono(12, 500, 0.1), { color: c.ink2 }]}>{t.studio}</Text>
          <Pressable
            onPress={onFocus}
            hitSlop={metrics.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={t.focusTask}
            android_ripple={null}
          >
            <EllipsisIcon color={c.ink2} />
          </Pressable>
        </View>

        <View
          style={[
            {
              paddingTop: 20,
              paddingBottom: 16,
              flexDirection: row(rtl),
              gap: 14,
              alignItems: 'flex-start',
            },
            pad(rtl, metrics.gutter, metrics.gutter),
          ]}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderWidth: 1.5,
              borderColor: c.ink,
              borderRadius: 5,
              marginTop: 6,
            }}
          />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(30, { lineHeight: 36 }), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
          >
            {t.task1}
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
          <View
            style={[
              {
                minHeight: unit,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.gutter, metrics.gutter),
            ]}
          >
            <Text style={[mono(11, 500, 0.1, true), { width: metrics.labelColumn, color: c.ink3, textAlign: align(rtl) }]}>
              {t.when}
            </Text>
            <Text style={[ui(15), { lineHeight: undefined, color: c.ink }]}>
              {t.today}
              {' · '}
              <Text style={mono(15)}>10:00</Text>
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[mono(12, 500), { color: c.ink3 }]}>{'↻ '}{t.weekly}</Text>
          </View>

          <View
            style={[
              {
                minHeight: unit,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.gutter, metrics.gutter),
            ]}
          >
            <Text style={[mono(11, 500, 0.1, true), { width: metrics.labelColumn, color: c.ink3, textAlign: align(rtl) }]}>
              {t.reminder}
            </Text>
            <Text style={[ui(15), { lineHeight: undefined, color: c.ink }]}>
              09:30{' · '}{t.snoozeHint}
            </Text>
          </View>

          <View
            style={[
              {
                minHeight: unit,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.gutter, metrics.gutter),
            ]}
          >
            <Text style={[mono(11, 500, 0.1, true), { width: metrics.labelColumn, color: c.ink3, textAlign: align(rtl) }]}>
              {t.priority}
            </Text>
            <Chip label={t.high} bg={c.verS} fg={c.ver} />
            <Chip label="#invoice" bg={c.blueS} fg={c.blue} />
          </View>

          <View
            style={[
              {
                minHeight: unit,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.gutter, metrics.gutter),
            ]}
          >
            <Text style={[mono(11, 500, 0.1, true), { width: metrics.labelColumn, color: c.ink3, textAlign: align(rtl) }]}>
              {t.subtasks}
            </Text>
            <Text style={[mono(13, 500), { color: c.ink2 }]}>
              {doneCount} / {subtasks.length}
            </Text>
          </View>

          <View style={{ position: 'relative' }}>
            <View
              pointerEvents="none"
              style={[
                { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: c.ver, opacity: 0.6 },
                insetStart(rtl, metrics.marginLine),
              ]}
            />
            {subtasks.map((s) => (
              <SubtaskRow
                key={s.id}
                task={s}
                onToggle={() => completeSubtask(s.id, s.completedAt === null)}
              />
            ))}
          </View>

          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: metrics.gutter,
              borderBottomWidth: 1,
              borderBottomColor: c.rule,
            }}
          >
            <Text style={[mono(11, 500, 0.1), { color: c.ink3, marginBottom: 6, textAlign: align(rtl) }]}>
              {t.notes}
            </Text>
            <Text style={[ui(15, 400, 22), { color: c.ink2, textAlign: align(rtl) }]}>
              {t.noteBody}
            </Text>
          </View>

          <View
            style={[
              { paddingVertical: 14, flexDirection: row(rtl), gap: 10, alignItems: 'center' },
              pad(rtl, metrics.gutter, metrics.gutter),
            ]}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.card,
                backgroundColor: c.paper2,
                borderWidth: 1,
                borderColor: c.rule,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PaperclipIcon size={20} color={c.ink3} />
            </View>
            <View>
              <Text style={[ui(13, 400, 18), { color: c.ink3, textAlign: align(rtl) }]}>
                invoice-0918.pdf {'·'} 240 KB
              </Text>
              <Text style={[ui(13, 400, 18), { color: c.ink3, textAlign: align(rtl) }]}>
                {t.attachHint}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
