import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, insetStart, marginStart, pad, row } from '../lib/rtl';
import { Screen, useHeaderTop } from '../components/Screen';
import { SearchIcon } from '../components/Icon';

type Filter = 'all' | 'tasks' | 'notes' | 'completed';

export function SearchScreen({ onOpenProject }: { onOpenProject: () => void }) {
  const { c, t, ui, mono, rtl } = useTheme();
  const top = useHeaderTop();
  const [typed, setTyped] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const query = typed ?? t.searchQ;

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'tasks', label: t.tasks },
    { key: 'notes', label: t.notes },
    { key: 'completed', label: t.completed },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.tabBar }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter }}>
          <View
            style={{
              height: 48,
              borderRadius: radius.card,
              backgroundColor: c.paper2,
              borderWidth: 1,
              borderColor: c.rule,
              flexDirection: row(rtl),
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 14,
            }}
          >
            <SearchIcon size={20} color={c.ink3} />
            <TextInput
              value={query}
              onChangeText={setTyped}
              selectionColor={c.ink}
              placeholder={t.searchQ}
              placeholderTextColor={c.ink3}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              accessibilityLabel={t.search}
              style={[ui(17), { flex: 1, color: c.ink, padding: 0, textAlign: align(rtl) }]}
            />
          </View>
        </View>

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
                  height: 30,
                  paddingHorizontal: 12,
                  borderRadius: radius.chip,
                  backgroundColor: on ? c.ink : 'transparent',
                  borderWidth: on ? 0 : 1,
                  borderColor: c.rule,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[ui(13, 500), { color: on ? c.paper : c.ink2, lineHeight: undefined }]}>
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
              { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: c.ver, opacity: 0.6 },
              insetStart(rtl, metrics.marginLine),
            ]}
          />

          <ResultHeader label={`${t.tasks} · 2`} />

          <View
            style={[
              {
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, 16, metrics.gutter),
            ]}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderWidth: 1.5,
                borderColor: c.ink,
                borderRadius: radius.checkbox,
                flexShrink: 0,
              }}
            />
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 16)]}
            >
              <Text style={{ backgroundColor: c.ochS }}>{` ${t.searchQ} `}</Text>
              {` ${t.searchR1}`}
            </Text>
            <Text style={[mono(12, 500), { color: c.ink3 }]}>{t.today}</Text>
          </View>

          <View
            style={[
              {
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, 16, metrics.gutter),
            ]}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderWidth: 1.5,
                borderColor: c.ink,
                borderRadius: radius.checkbox,
                backgroundColor: c.ink,
                flexShrink: 0,
              }}
            />
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                ui(17),
                {
                  flex: 1,
                  color: c.ink3,
                  textDecorationLine: 'line-through',
                  textAlign: align(rtl),
                },
                marginStart(rtl, 16),
              ]}
            >
              {t.searchR2}
            </Text>
            <Text style={[mono(12, 500), { color: c.ink3 }]}>{t.lastWeek}</Text>
          </View>

          <ResultHeader label={`${t.tags} · 1`} />

          <Pressable
            onPress={onOpenProject}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel="#invoice"
            style={[
              {
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.content, metrics.gutter),
            ]}
          >
            <View
              style={{
                height: 26,
                paddingHorizontal: 10,
                borderRadius: radius.chip,
                backgroundColor: c.ochS,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[ui(12, 500), { color: c.och, lineHeight: undefined }]}>#invoice</Text>
            </View>
            <Text style={[mono(12, 500), { color: c.ink3 }]}>6</Text>
          </Pressable>

          <ResultHeader label={`${t.notes} · 1`} />

          <View
            style={[
              {
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, metrics.content, metrics.gutter),
            ]}
          >
            <Text
              numberOfLines={1}
              style={[ui(15), { flex: 1, color: c.ink2, textAlign: align(rtl) }]}
            >
              {`…${t.searchR3}…`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function ResultHeader({ label }: { label: string }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={[
        {
          height: metrics.row,
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
