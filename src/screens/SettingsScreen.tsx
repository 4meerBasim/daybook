import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { Screen, useHeaderTop } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { Toggle } from '../components/Toggle';
import { Dot } from '../components/Ledger';

export function SettingsScreen({ onOpenGestures }: { onOpenGestures: () => void }) {
  const { c, t, lang, appearance, motion, ui, display, rtl, setLang, setAppearance, setMotion } =
    useTheme();
  const top = useHeaderTop();

  return (
    <Screen>
      <ScrollView>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.settings}
          </Text>
        </View>

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
            <RowLabel label={t.weekStart} />
            <Text style={[ui(15), { color: c.ink3 }]}>{t.weekStartLabel}</Text>
          </Row>

          <Row>
            <RowLabel label={t.reminders} />
            <Text style={[ui(15), { color: c.ink3 }]}>{`09:00 · ${t.eveningReview}`}</Text>
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

          <Row>
            <RowLabel label={t.sharing} />
            <Text style={[ui(15), { color: c.ink3 }]}>{t.sharingVal}</Text>
          </Row>
        </View>
      </ScrollView>
    </Screen>
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
  const { c, rtl } = useTheme();
  const style = {
    height: metrics.row,
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
