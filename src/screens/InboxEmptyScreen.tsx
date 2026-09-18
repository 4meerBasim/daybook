import React from 'react';
import { Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, insetEnd, insetStart } from '../lib/rtl';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { EmptyRules } from '../components/Ledger';

export function InboxEmptyScreen() {
  const { c, t, display, ui, rtl } = useTheme();
  const scrollY = useSharedValue(0);

  return (
    <Screen>
      <PageHeader title={t.inbox} scrollY={scrollY} />

      <View
        style={{
          height: 600,
          borderTopWidth: 1,
          borderTopColor: c.rule,
          overflow: 'hidden',
        }}
      >
        <EmptyRules count={11} />
        <View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: c.ver, opacity: 0.6 },
            insetStart(rtl, metrics.marginLine),
          ]}
        />
        <View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 168 }, insetStart(rtl, metrics.content), insetEnd(rtl, metrics.gutter)]}
        >
          <Text style={[display(28, { weight: 400, italic: true }), { color: c.ink, textAlign: align(rtl) }]}>
            {t.nothingWaiting}
          </Text>
          <Text style={[ui(15, 400, 22), { color: c.ink2, marginTop: 12, textAlign: align(rtl) }]}>
            {t.inboxHint}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
