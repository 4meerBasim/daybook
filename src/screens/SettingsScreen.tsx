import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align } from '../lib/rtl';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { SettingsRows } from '../components/SettingsRows';

export function SettingsScreen({
  onOpenGestures,
  onOpenProjects,
  onOpenUnfiled,
  onOpenClosedPages,
}: {
  onOpenGestures: () => void;
  onOpenProjects: () => void;
  onOpenUnfiled: () => void;
  onOpenClosedPages: () => void;
}) {
  const { c, t, display, rtl } = useTheme();
  const top = useHeaderTop();
  const bottom = useScreenBottom();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.settings}
          </Text>
        </View>

        <SettingsRows
          onOpenGestures={onOpenGestures}
          onOpenProjects={onOpenProjects}
          onOpenUnfiled={onOpenUnfiled}
          onOpenClosedPages={onOpenClosedPages}
        />
      </ScrollView>
    </Screen>
  );
}
