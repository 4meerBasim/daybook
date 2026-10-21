import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align } from '../lib/rtl';
import { Screen, useHeaderTop } from '../components/Screen';
import { SettingsRows } from '../components/SettingsRows';

export function SettingsScreen({
  onOpenGestures,
  onOpenProjects,
}: {
  onOpenGestures: () => void;
  onOpenProjects: () => void;
}) {
  const { c, t, display, rtl } = useTheme();
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

        <SettingsRows onOpenGestures={onOpenGestures} onOpenProjects={onOpenProjects} />
      </ScrollView>
    </Screen>
  );
}
