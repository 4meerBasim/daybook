import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { minutesLabel } from '../lib/date';
import { tagColors } from '../lib/parse';
import { useStore } from '../state/store';
import { rowTitle, taskTags, type TaskRow } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { Chip } from '../components/Chip';
import { TriageChip } from '../components/TriageChip';
import { CloseIcon } from '../components/Icon';

const MINUTE_LIMITS = [5, 15, 30] as const;

function fits(task: TaskRow, limit: number | null, context: string | null): boolean {
  if (limit !== null && (task.duration === null || task.duration > limit)) return false;
  if (context !== null && !taskTags(task).includes(context)) return false;
  return true;
}

export function DealScreen({
  onClose,
  onFocus,
}: {
  onClose: () => void;
  onFocus: (taskId: string) => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { dealable, complete, startSession } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();

  const [limit, setLimit] = useState<number | null>(null);
  const [context, setContext] = useState<string | null>(null);
  const [refused, setRefused] = useState<string[]>([]);
  const [dealt, setDealt] = useState<TaskRow | null>(null);

  const contexts = useMemo(() => {
    const seen = new Set<string>();
    for (const task of dealable) for (const tag of taskTags(task)) seen.add(tag);
    return [...seen].sort();
  }, [dealable]);

  const deck = dealable.filter((k) => fits(k, limit, context));
  const drawable = deck.filter((k) => !refused.includes(k.id) && k.id !== dealt?.id);

  const deal = () => {
    const pool = drawable.length ? drawable : deck.filter((k) => k.id !== dealt?.id);
    if (!pool.length) {
      setDealt(null);
      return;
    }
    if (!drawable.length) setRefused([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDealt(pool[Math.floor(Math.random() * pool.length)]);
  };

  const refuse = () => {
    if (dealt) setRefused((prev) => [...prev, dealt.id]);
    deal();
  };

  const narrow = (next: { limit?: number | null; context?: string | null }) => {
    if (next.limit !== undefined) setLimit(next.limit);
    if (next.context !== undefined) setContext(next.context);
    setRefused([]);
    setDealt(null);
  };

  return (
    <Screen paper2>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: 24,
            flexDirection: row(rtl),
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>{t.dealTitle}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={metrics.hitSlop}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.cancel}
          >
            <CloseIcon size={22} color={c.ink2} />
          </Pressable>
        </View>

        <View style={{ paddingTop: 20, paddingHorizontal: 24, gap: 10 }}>
          <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {t.howLong}
          </Text>
          <View style={{ flexDirection: row(rtl), gap: 8, flexWrap: 'wrap' }}>
            <TriageChip
              label={t.anyLength}
              tint={c.paper}
              onPress={() => narrow({ limit: null })}
            />
            {MINUTE_LIMITS.map((m) => (
              <TriageChip
                key={m}
                label={minutesLabel(m, t)}
                tint={c.paper}
                onPress={() => narrow({ limit: m })}
              />
            ))}
          </View>

          {contexts.length ? (
            <>
              <Text
                style={[
                  mono(11, 500, 0.1),
                  { color: c.ink3, marginTop: 8, textAlign: align(rtl) },
                ]}
              >
                {t.whereAreYou}
              </Text>
              <View style={{ flexDirection: row(rtl), gap: 8, flexWrap: 'wrap' }}>
                <TriageChip
                  label={t.anyContext}
                  tint={c.paper}
                  onPress={() => narrow({ context: null })}
                />
                {contexts.map((tag) => (
                  <TriageChip
                    key={tag}
                    label={`#${tag}`}
                    tint={c.paper}
                    onPress={() => narrow({ context: tag })}
                  />
                ))}
              </View>
            </>
          ) : null}

          <View style={{ flexDirection: row(rtl), gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {limit === null ? null : (
              <Chip label={minutesLabel(limit, t)} bg={c.blueS} fg={c.blue} />
            )}
            {context === null ? null : (
              <Chip label={`#${context}`} {...tagColors(context, c)} />
            )}
            <Text style={[mono(12, 500), { color: c.ink3, alignSelf: 'center' }]}>
              {t.inTheDeck.replace('{n}', String(deck.length))}
            </Text>
          </View>
        </View>

        <View style={{ paddingTop: 48, paddingHorizontal: 24, minHeight: 200 }}>
          {dealt ? (
            <>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[display(34, { lineHeight: 40 }), { color: c.ink, textAlign: align(rtl) }]}
              >
                {rowTitle(dealt, t)}
              </Text>
              <View style={{ flexDirection: row(rtl), gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {dealt.duration === null ? null : (
                  <Chip label={minutesLabel(dealt.duration, t)} bg={c.mossS} fg={c.moss} />
                )}
                {taskTags(dealt).map((tag) => (
                  <Chip key={tag} label={`#${tag}`} {...tagColors(tag, c)} />
                ))}
              </View>
            </>
          ) : (
            <Text
              style={[
                display(24, { weight: 400, italic: true }),
                { color: c.ink3, textAlign: align(rtl) },
              ]}
            >
              {deck.length ? t.dealPrompt : t.deckEmpty}
            </Text>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: bottom + 24,
          left: 24,
          right: 24,
          gap: 10,
        }}
      >
        {dealt ? (
          <View style={{ flexDirection: row(rtl), gap: 10 }}>
            <Pressable
              onPress={() => {
                startSession(dealt.id);
                onFocus(dealt.id);
              }}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.focusTask}
              style={{
                flex: 1,
                height: metrics.pen,
                borderRadius: radius.card,
                backgroundColor: c.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[ui(17, 500), { color: c.paper }]}>{t.focusTask}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                complete(dealt.id, true);
                setDealt(null);
              }}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.done}
              style={{
                height: metrics.pen,
                paddingHorizontal: 20,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: c.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[ui(17, 500), { color: c.ink }]}>{t.done}</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={dealt ? refuse : deal}
          disabled={!deck.length}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={dealt ? t.dealAnother : t.dealMeOne}
          accessibilityState={{ disabled: !deck.length }}
          style={{
            height: metrics.pen,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: deck.length ? c.ink : c.rule,
            backgroundColor: dealt ? 'transparent' : deck.length ? c.ink : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={[
              ui(17, 500),
              { color: dealt ? c.ink : deck.length ? c.paper : c.ink3 },
            ]}
          >
            {dealt ? t.dealAnother : t.dealMeOne}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
