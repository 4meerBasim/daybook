import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { useTabBarFootprint } from '../components/TabBar';
import { align, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { Screen, useHeaderTop } from '../components/Screen';
import { SettingsRows } from '../components/SettingsRows';
import { NameSheet } from '../components/NameSheet';

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (words[0][0] + last).toUpperCase();
}

export function ProfileScreen({
  onOpenGestures,
  onOpenProjects,
}: {
  onOpenGestures: () => void;
  onOpenProjects: () => void;
}) {
  const { c, t, display, mono, rtl } = useTheme();
  const tabBarFootprint = useTabBarFootprint();
  const { displayName, setDisplayName } = useStore();
  const top = useHeaderTop();
  const [naming, setNaming] = useState(false);

  const named = displayName.length > 0;
  const name = named ? displayName : t.you;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarFootprint }}>
        <Pressable
          onPress={() => setNaming(true)}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.yourName}
          style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}
        >
          <View style={{ flexDirection: row(rtl), marginBottom: 12 }}>
            <View
              style={{
                width: metrics.avatar,
                height: metrics.avatar,
                borderRadius: radius.pen,
                backgroundColor: c.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[mono(22, 500, 0, true), { color: c.paper, lineHeight: undefined }]}
              >
                {initials(name)}
              </Text>
            </View>
          </View>

          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {name}
          </Text>

          {named ? null : (
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                display(15, { weight: 400, italic: true }),
                { color: c.ink2, textAlign: align(rtl) },
              ]}
            >
              {t.writeYourName}
            </Text>
          )}
        </Pressable>

        <SettingsRows onOpenGestures={onOpenGestures} onOpenProjects={onOpenProjects} />
      </ScrollView>

      {naming ? (
        <NameSheet
          initial={displayName}
          placeholder={t.yourName}
          onClose={() => setNaming(false)}
          onSubmit={setDisplayName}
        />
      ) : null}
    </Screen>
  );
}
