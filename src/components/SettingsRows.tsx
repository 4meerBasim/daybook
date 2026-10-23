import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { CAPACITY_OPTIONS } from '../db/schema';
import { minutesLabel } from '../lib/date';
import { askPermission } from '../lib/reminders';
import { Segmented } from './Segmented';
import { Toggle } from './Toggle';
import { Dot } from './Ledger';

export function SettingsRows({
  onOpenGestures,
  onOpenProjects,
  onOpenUnfiled,
  onOpenClosedPages,
  onOpenWeekly,
  onOpenNotes,
}: {
  onOpenGestures: () => void;
  onOpenProjects: () => void;
  onOpenUnfiled: () => void;
  onOpenClosedPages: () => void;
  onOpenWeekly: () => void;
  onOpenNotes: () => void;
}) {
  const { c, t, lang, appearance, motion, ui, rtl, setLang, setAppearance, setMotion } = useTheme();
  const {
    projects,
    unfiled,
    notes,
    closedDays,
    capacity,
    setCapacity,
    decayOn,
    setDecayOn,
    remindersOn,
    setRemindersOn,
  } = useStore();

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
      <Row
        onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
        label={`${t.language}: ${t.langLabel}`}
      >
        <RowLabel label={t.language} />
        <Text style={[ui(15), { color: c.ink3 }]}>{t.langLabel}</Text>
      </Row>

      <Row>
        <RowLabel label={t.appearance} />
        <Segmented
          options={[
            { key: 'light', label: t.light },
            { key: 'dark', label: t.dark },
            { key: 'auto', label: t.auto },
          ]}
          value={appearance}
          onChange={setAppearance}
        />
      </Row>

      <Row>
        <RowLabel label={t.dayCapacity} />
        <Segmented
          options={CAPACITY_OPTIONS.map((m) => ({ key: String(m), label: minutesLabel(m, t) }))}
          value={String(capacity)}
          onChange={(v) => setCapacity(Number(v))}
        />
      </Row>

      <Row>
        <RowLabel label={t.weekStart} />
        <Text style={[ui(15), { color: c.ink3 }]}>{t.weekStartLabel}</Text>
      </Row>

      <Row>
        <RowLabel label={t.reminders} />
        <Toggle
          value={remindersOn}
          onChange={async (on) => {
            if (!on) {
              setRemindersOn(false);
              return;
            }
            setRemindersOn(await askPermission());
          }}
          accessibilityLabel={t.reminders}
        />
      </Row>

      <Row>
        <RowLabel label={t.textSize} />
        <Text style={[ui(15), { color: c.ink3 }]}>{t.system}</Text>
      </Row>

      <Row>
        <RowLabel label={t.reduceMotion} />
        <Toggle
          value={motion === 'reduced'}
          onChange={(v) => setMotion(v ? 'reduced' : 'full')}
          accessibilityLabel={t.reduceMotion}
        />
      </Row>

      <Row>
        <RowLabel label={t.inkDecay} />
        <Toggle value={decayOn} onChange={setDecayOn} accessibilityLabel={t.inkDecay} />
      </Row>

      <Row>
        <RowLabel label={t.sync} />
        <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
          <Dot color={c.moss} />
          <Text style={[ui(15), { color: c.moss }]}>{t.syncedAgo}</Text>
        </View>
      </Row>

      <Row onPress={onOpenGestures} label={t.shortcuts}>
        <RowLabel label={t.shortcuts} />
        <View style={{ flexDirection: row(rtl), gap: 4 }}>
          <Keycap label="⌘" />
          <Keycap label="N" />
        </View>
      </Row>

      <Row onPress={onOpenNotes} label={t.notesTitle}>
        <RowLabel label={t.notesTitle} />
        <Text style={[ui(15), { color: c.ink3 }]}>{String(notes.length)}</Text>
      </Row>

      <Row onPress={onOpenProjects} label={t.projects}>
        <RowLabel label={t.projects} />
        <Text style={[ui(15), { color: c.ink3 }]}>{String(projects.length)}</Text>
      </Row>

      <Row onPress={onOpenWeekly} label={t.weeklyReviewRow}>
        <RowLabel label={t.weeklyReviewRow} />
        <Dot color={c.moss} />
      </Row>

      <Row onPress={onOpenClosedPages} label={t.closedPages}>
        <RowLabel label={t.closedPages} />
        <Text style={[ui(15), { color: c.ink3 }]}>{String(closedDays.length)}</Text>
      </Row>

      <Row onPress={onOpenUnfiled} label={t.unfiled}>
        <RowLabel label={t.unfiled} />
        <Text style={[ui(15), { color: c.ink3 }]}>
          {String(unfiled.filter((k) => k.completedAt === null).length)}
        </Text>
      </Row>

      <Row onPress={onOpenNotes} label={t.sharing}>
        <RowLabel label={t.sharing} />
        <Text numberOfLines={1} style={[ui(15), { flexShrink: 1, color: c.ink3 }]}>
          {t.sharingVal}
        </Text>
      </Row>
    </View>
  );
}

function Row({
  children,
  onPress,
  label,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  label?: string;
}) {
  const { c, rtl, unit } = useTheme();
  const style = {
    minHeight: unit,
    flexDirection: row(rtl),
    alignItems: 'center' as const,
    paddingHorizontal: metrics.gutter,
    borderBottomWidth: 1,
    borderBottomColor: c.rule,
  };

  if (!onPress) return <View style={style}>{children}</View>;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
    >
      {children}
    </Pressable>
  );
}

function RowLabel({ label }: { label: string }) {
  const { c, ui, rtl } = useTheme();
  return (
    <Text
      numberOfLines={1}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
    >
      {label}
    </Text>
  );
}

function Keycap({ label }: { label: string }) {
  const { c, mono } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.rule,
        borderRadius: radius.checkbox,
        paddingHorizontal: 5,
        paddingVertical: 1,
      }}
    >
      <Text style={[mono(12, 500), { color: c.ink3, lineHeight: undefined }]}>{label}</Text>
    </View>
  );
}
