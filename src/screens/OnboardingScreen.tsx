import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { Screen } from '../components/Screen';

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const { c, t, ar, ui, mono, display, rtl, setLang } = useTheme();

  const enBg = ar ? 'transparent' : c.ink;
  const enFg = ar ? c.ink : c.paper;
  const arBg = ar ? c.ink : 'transparent';
  const arFg = ar ? c.paper : c.ink;

  const rules = [t.onb1, t.onb2, t.onb3];

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          paddingTop: 120,
          paddingHorizontal: 28,
        }}
      >
        <Text style={[mono(12, 500, 0.12), { color: c.ink3, textAlign: align(rtl) }]}>{t.brand}</Text>

        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            display(44, { lineHeight: 44 * 1.05 }),
            { color: c.ink, marginTop: 16, textAlign: align(rtl) },
          ]}
        >
          {t.onbTitle}
        </Text>

        <View style={{ marginTop: 36, borderTopWidth: 1, borderTopColor: c.rule }}>
          {rules.map((text, i) => (
            <View
              key={i}
              style={{
                height: 56,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              }}
            >
              <Text style={[mono(13, 500), { color: c.ver, width: 22, textAlign: align(rtl) }]}>
                {i + 1}
              </Text>
              <Text
                maxFontSizeMultiplier={1.6}
                style={[ui(17, 400, 22), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
              >
                {text}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: row(rtl), gap: 8, marginBottom: 16 }}>
          <Pressable
            onPress={() => setLang('en')}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel="English"
            accessibilityState={{ selected: !ar }}
            style={{
              flex: 1,
              height: 44,
              borderWidth: 1,
              borderColor: c.ink,
              borderRadius: radius.card,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: enBg,
            }}
          >
            <Text style={[ui(15, 500), { color: enFg }]}>English</Text>
          </Pressable>
          <Pressable
            onPress={() => setLang('ar')}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel="العربية"
            accessibilityState={{ selected: ar }}
            style={{
              flex: 1,
              height: 44,
              borderWidth: 1,
              borderColor: c.ink,
              borderRadius: radius.card,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: arBg,
            }}
          >
            <Text style={[ui(16, 500), { color: arFg }]}>العربية</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onStart}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.start}
          style={{
            height: 56,
            borderRadius: radius.card,
            backgroundColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 56,
          }}
        >
          <Text style={[ui(17, 500), { color: c.paper }]}>{t.start}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
