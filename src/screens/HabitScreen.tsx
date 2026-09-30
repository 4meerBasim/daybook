import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { useHabits, useStore } from '../state/store';
import { Screen, useHeaderTop } from '../components/Screen';
import { CheckIcon, StreakTallyIcon } from '../components/Icon';

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const timeOfDay = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function HabitScreen({ habitId, onClose }: { habitId: string; onClose: () => void }) {
  const { c, t, rtl, display, ui, mono } = useTheme();
  const { habitSessions, addHabitSession } = useStore();
  const habit = useHabits().find((h) => h.id === habitId);
  const sessions = habitSessions.filter((s) => s.habitId === habitId);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const top = useHeaderTop();
  const running = startedAt !== null;

  const record = (from: number) => {
    const seconds = Math.floor((Date.now() - from) / 1000);
    if (seconds > 0) addHabitSession({ habitId, startedAt: from, seconds });
    return seconds;
  };

  const startedRef = useRef(startedAt);
  startedRef.current = startedAt;

  useEffect(
    () => () => {
      if (startedRef.current !== null) record(startedRef.current);
    },
    []
  );

  useEffect(() => {
    if (startedAt === null) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startedAt]);

  const toggleRun = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (startedAt === null) {
      setElapsed(0);
      setStartedAt(Date.now());
      return;
    }
    setElapsed(record(startedAt));
    setStartedAt(null);
  };

  const spoken = (seconds: number) =>
    `${Math.floor(seconds / 60)} ${t.minutes} ${seconds % 60} ${t.seconds}`;

  const runLabel = running ? t.stop : t.startTimer;
  const history = sessions.map((s, i) => ({ ...s, n: i + 1 })).reverse();

  return (
    <Screen paper2>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 + metrics.pen + 56 + 24 }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: 24,
            flexDirection: row(rtl),
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>{t.habits}</Text>
          {habit && habit.streak > 0 ? (
            <View
              accessible
              accessibilityLabel={`${t.streak} ${habit.streak}`}
              style={{ flexDirection: row(rtl), alignItems: 'center' }}
            >
              <StreakTallyIcon color={c.moss} flip={rtl} />
              <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>
                {habit.streak}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            display(34, { lineHeight: 40 }),
            { color: c.ink, paddingTop: 48, paddingHorizontal: 24, textAlign: align(rtl) },
          ]}
        >
          {habit?.name}
        </Text>

        <Text
          allowFontScaling={false}
          accessibilityRole="timer"
          accessibilityLabel={spoken(elapsed)}
          style={[
            mono(64, 500, -0.03),
            {
              color: c.ink,
              lineHeight: 64,
              paddingTop: 32,
              paddingHorizontal: 24,
              fontVariant: ['tabular-nums'],
              writingDirection: 'ltr',
              textAlign: align(rtl),
            },
          ]}
        >
          {clock(elapsed)}
        </Text>

        <View
          accessible
          accessibilityLabel={`${t.sessionsToday}: ${sessions.length}`}
          style={{ gap: 4, paddingVertical: 24, paddingHorizontal: 24 }}
        >
          <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
            {t.sessionsToday}
          </Text>
          <Text
            allowFontScaling={false}
            style={[mono(34, 500), { color: c.moss, textAlign: align(rtl) }]}
          >
            {sessions.length}
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
          <View
            style={{
              height: metrics.row,
              flexDirection: row(rtl),
              alignItems: 'center',
              paddingHorizontal: 24,
              borderBottomWidth: 1,
              borderBottomColor: c.rule,
            }}
          >
            <Text style={[mono(11, 500, 0.1), { color: c.ink3 }]}>{t.history}</Text>
          </View>

          {history.length === 0 ? (
            <View style={{ height: metrics.row, justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[ui(15), { color: c.ink3, textAlign: align(rtl) }]}
              >
                {t.noSessions}
              </Text>
            </View>
          ) : null}

          {history.map((s) => (
            <View
              key={s.n}
              accessible
              accessibilityLabel={`${s.n}, ${t.started} ${timeOfDay(s.startedAt)}, ${t.lasted} ${spoken(s.seconds)}`}
              style={{
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 16,
                paddingHorizontal: 24,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              }}
            >
              <Text style={[mono(12, 500), { width: 24, color: c.ink3, textAlign: align(rtl) }]}>
                {s.n}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  mono(17, 500),
                  { flex: 1, color: c.ink, writingDirection: 'ltr', textAlign: align(rtl) },
                ]}
              >
                {timeOfDay(s.startedAt)}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  mono(13, 500),
                  { color: c.ink2, fontVariant: ['tabular-nums'], writingDirection: 'ltr' },
                ]}
              >
                {clock(s.seconds)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 12,
          paddingBottom: 56,
          paddingHorizontal: 24,
          backgroundColor: c.paper2,
          flexDirection: row(rtl),
          gap: 12,
        }}
      >
        <Pressable
          onPress={toggleRun}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={runLabel}
          style={{
            flex: 1,
            height: metrics.pen,
            borderRadius: radius.card,
            backgroundColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[ui(17, 500), { color: c.paper }]}>{runLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.done}
          style={{
            width: metrics.pen,
            height: metrics.pen,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon width={14} height={12} color={c.ink} />
        </Pressable>
      </View>
    </Screen>
  );
}
