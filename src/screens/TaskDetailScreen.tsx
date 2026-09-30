import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, priorityColors, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useStore, useTasks } from '../state/store';
import { projects } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { Checkbox } from '../components/Ledger';
import { Chip } from '../components/Chip';
import { ChevronBackIcon, EllipsisIcon } from '../components/Icon';

export function TaskDetailScreen({
  taskId,
  onBack,
  onFocus,
}: {
  taskId: string;
  onBack: () => void;
  onFocus: () => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { done, toggle } = useStore();
  const top = useHeaderTop();

  const task = useTasks().find((k) => k.id === taskId);
  const project = projects(t).find((p) => p.id === task?.projectId);
  const checked = !!done[taskId];
  const priority = task?.priority ?? 'none';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.tabBar }}>
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
          <Text style={[mono(12, 500, 0.1, true), { color: c.ink2 }]}>
            {task ? (project ? project.name : t.noProject) : ''}
          </Text>
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

        {task ? (
          <>
            <Pressable
              onPress={() => {
                if (!checked) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggle(taskId);
              }}
              android_ripple={null}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={task.title}
              style={{
                paddingTop: 24,
                paddingBottom: 16,
                paddingHorizontal: metrics.gutter,
                flexDirection: row(rtl),
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <View style={{ marginTop: 8 }}>
                <Checkbox checked={checked} />
              </View>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[
                  display(30, { lineHeight: 36 }),
                  {
                    flex: 1,
                    color: checked ? c.ink3 : c.ink,
                    textDecorationLine: checked ? 'line-through' : 'none',
                    textAlign: align(rtl),
                  },
                ]}
              >
                {task.title}
              </Text>
            </Pressable>

            <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
              <Field label={t.when}>
                <Text
                  style={[
                    ui(15),
                    { lineHeight: undefined, color: task.over && !checked ? c.ver : c.ink },
                  ]}
                >
                  {task.meta || t[task.list]}
                </Text>
              </Field>

              <Field label={t.priority}>
                {priority === 'none' ? (
                  <Chip label={t.none} outline />
                ) : (
                  <Chip
                    label={t[priority]}
                    bg={c[priorityColors[priority].bg]}
                    fg={c[priorityColors[priority].fg]}
                  />
                )}
              </Field>

              <Field label={t.status}>
                <Chip label={checked ? t.done : t[task.status ?? 'todo']} outline />
              </Field>

              <View
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: metrics.gutter,
                  gap: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: c.rule,
                }}
              >
                <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
                  {t.description}
                </Text>
                <Text
                  style={[
                    ui(15, 400, 22),
                    { color: task.desc ? c.ink2 : c.ink3, textAlign: align(rtl) },
                  ]}
                >
                  {task.desc || t.none}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={{
        height: metrics.row,
        flexDirection: row(rtl),
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: metrics.gutter,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <Text
        style={[
          mono(11, 500, 0.1, true),
          { width: metrics.labelColumn, color: c.ink3, textAlign: align(rtl) },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
