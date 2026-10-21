import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { useTabBarFootprint } from '../components/TabBar';
import { align, insetStart, marginStart, pad, row } from '../lib/rtl';
import { useHeaderTop } from '../components/Screen';
import { LedgerRow } from '../components/Ledger';
import { Chip } from '../components/Chip';

type Filter = 'all' | 'tasks' | 'notes' | 'completed';

export function SearchResults({
  progress,
  visible,
  onOpenProject,
}: {
  progress: SharedValue<number>;
  visible: boolean;
  onOpenProject: () => void;
}) {
  const { c, t, ui, mono, rtl, unit, chipPadding } = useTheme();
  const tabBarFootprint = useTabBarFootprint();
  const top = useHeaderTop();
  const [filter, setFilter] = useState<Filter>('all');

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'tasks', label: t.tasks },
    { key: 'notes', label: t.notes },
    { key: 'completed', label: t.completed },
  ];

  const sheet = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 16 }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: c.paper },
        sheet,
      ]}
    >
      <ScrollView contentContainerStyle={{ paddingTop: top, paddingBottom: tabBarFootprint }}>
        <View
          style={{
            flexDirection: row(rtl),
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: metrics.gutter,
          }}
        >
          {filters.map((f) => {
            const on = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={f.label}
                hitSlop={{ top: 7, bottom: 7 }}
                android_ripple={null}
                style={{
                  minHeight: 30,
                  paddingHorizontal: chipPadding + 2,
                  borderRadius: radius.chip,
                  backgroundColor: on ? c.ink : 'transparent',
                  borderWidth: on ? 0 : 1,
                  borderColor: c.rule,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={[ui(13, 500), { color: on ? c.paper : c.ink2, lineHeight: 18 }]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ position: 'relative', borderTopWidth: 1, borderTopColor: c.rule }}>
          <View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: c.ver,
                opacity: 0.6,
              },
              insetStart(rtl, metrics.marginLine),
            ]}
          />

          <ResultHeader label={`${t.tasks} · 2`} />

          <LedgerRow>
            <View
              style={{
                width: metrics.checkbox,
                height: metrics.checkbox,
                borderWidth: 1.5,
                borderColor: c.ink,
                borderRadius: radius.checkbox,
                flexShrink: 0,
              }}
            />
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                ui(17, 400, 22),
                { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
                marginStart(rtl, 16),
              ]}
            >
              <Text style={{ backgroundColor: c.ochS }}>{` ${t.searchQ} `}</Text>
              {` ${t.searchR1}`}
            </Text>
            <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
              {t.today}
            </Text>
          </LedgerRow>

          <LedgerRow>
            <View
              style={{
                width: metrics.checkbox,
                height: metrics.checkbox,
                borderWidth: 1.5,
                borderColor: c.ink,
                borderRadius: radius.checkbox,
                backgroundColor: c.ink,
                flexShrink: 0,
              }}
            />
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                ui(17, 400, 22),
                {
                  flex: 1,
                  minWidth: 0,
                  color: c.ink3,
                  textDecorationLine: 'line-through',
                  textAlign: align(rtl),
                },
                marginStart(rtl, 16),
              ]}
            >
              {t.searchR2}
            </Text>
            <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
              {t.lastWeek}
            </Text>
          </LedgerRow>

          <ResultHeader label={`${t.tags} · 1`} />

          <Pressable
            onPress={onOpenProject}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel="#invoice"
            style={[
              {
                minHeight: unit,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: metrics.gap,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.content, metrics.gutter),
            ]}
          >
            <Chip label="#invoice" bg={c.ochS} fg={c.och} />
            <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
              6
            </Text>
          </Pressable>

          <ResultHeader label={`${t.notes} · 1`} />

          <LedgerRow start={metrics.content}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(15, 400, 22), { flex: 1, minWidth: 0, color: c.ink2, textAlign: align(rtl) }]}
            >
              {`…${t.searchR3}…`}
            </Text>
          </LedgerRow>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function ResultHeader({ label }: { label: string }) {
  const { c, mono, rtl, unit } = useTheme();
  return (
    <View
      style={[
        {
          minHeight: unit,
          flexDirection: row(rtl),
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
        },
        pad(rtl, metrics.content, metrics.gutter),
      ]}
    >
      <Text style={[mono(11, 500, 0.1), { color: c.ink3 }]}>{label}</Text>
    </View>
  );
}
