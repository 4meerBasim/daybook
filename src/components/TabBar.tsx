import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, penShadow, radius } from '../theme/tokens';
import { row } from '../lib/rtl';
import { CalendarIcon, PageIcon, PenIcon, ProfileIcon, TrayIcon } from './Icon';

export type TabKey = 'today' | 'upcoming' | 'inbox' | 'profile';

const icons = {
  today: PageIcon,
  upcoming: CalendarIcon,
  inbox: TrayIcon,
  profile: ProfileIcon,
};

export function TabBar({
  active,
  onSelect,
  onPen,
  onLongPress,
}: {
  active: TabKey;
  onSelect: (k: TabKey) => void;
  onPen: () => void;
  onLongPress?: (k: TabKey) => void;
}) {
  const { c, t, rtl, dark } = useTheme();

  const items: TabKey[] = ['today', 'upcoming', 'inbox', 'profile'];

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: metrics.tabBar + 20 }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: metrics.tabBar,
          backgroundColor: c.paper2,
          borderTopWidth: 1,
          borderTopColor: c.rule,
          flexDirection: row(rtl),
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          paddingTop: 10,
          paddingHorizontal: 12,
        }}
      >
        {items.slice(0, 2).map((k) => (
          <TabItem
            key={k}
            tab={k}
            active={active === k}
            onPress={() => onSelect(k)}
            onLongPress={onLongPress ? () => onLongPress(k) : undefined}
          />
        ))}

        <View style={{ width: metrics.pen }} />

        {items.slice(2).map((k) => (
          <TabItem
            key={k}
            tab={k}
            active={active === k}
            onPress={() => onSelect(k)}
            onLongPress={onLongPress ? () => onLongPress(k) : undefined}
          />
        ))}
      </View>

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' }}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPen();
          }}
          accessibilityRole="button"
          accessibilityLabel={t.newTask}
          android_ripple={null}
          style={{
            width: metrics.pen,
            height: metrics.pen,
            borderRadius: radius.pen,
            backgroundColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
            ...penShadow(c, dark),
          }}
        >
          <PenIcon color={c.paper} />
        </Pressable>
      </View>
    </View>
  );
}

function TabItem({
  tab,
  active,
  onPress,
  onLongPress,
}: {
  tab: TabKey;
  active: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { c, t, ui } = useTheme();
  const Icon = icons[tab];
  const color = active ? c.ink : c.ink3;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={t[tab]}
      android_ripple={null}
      style={{ width: 56, height: 56, alignItems: 'center', gap: 4 }}
    >
      {tab === 'today' && active ? (
        <PageIcon color={c.ink} paper={c.paper2} />
      ) : (
        <Icon color={color} />
      )}
      <Text numberOfLines={1} style={[ui(11, 500), { color, lineHeight: undefined }]}>
        {t[tab]}
      </Text>
    </Pressable>
  );
}
