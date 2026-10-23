import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing, glass, maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, insetEnd, insetStart, row } from '../lib/rtl';
import { CalendarIcon, CloseIcon, PageIcon, PersonIcon, PlusIcon, SearchIcon } from './Icon';

export type TabKey = 'today' | 'upcoming' | 'profile';
export type ItemKey = TabKey | 'add';

type TabIcon = (props: { size?: number; color: string }) => React.ReactElement;

const icons: Record<ItemKey, TabIcon> = {
  today: PageIcon,
  upcoming: CalendarIcon,
  add: PlusIcon,
  profile: PersonIcon,
};

const ITEMS: ItemKey[] = ['today', 'upcoming', 'add', 'profile'];

export function useTabBarFootprint(): number {
  const insets = useSafeAreaInsets();
  return (
    metrics.tabBarHeight + metrics.tabBarLift + Math.max(insets.bottom, metrics.tabBarMinBottom)
  );
}

export function TabBar({
  active,
  onSelect,
  onAdd,
  onLongPress,
  searching,
  searchProgress,
  query,
  onQuery,
  onSearchOpen,
  onSearchClose,
}: {
  active: TabKey;
  onSelect: (k: TabKey) => void;
  onAdd: () => void;
  onLongPress?: (k: ItemKey) => void;
  searching: boolean;
  searchProgress: SharedValue<number>;
  query: string;
  onQuery: (v: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
}) {
  const { c, t, rtl, dark, reduced } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const keyboard = useAnimatedKeyboard();
  const g = glass(c, dark);

  const bottom = Math.max(insets.bottom, metrics.tabBarMinBottom);
  const inner = width - metrics.tabBarInset * 2;
  const capsule = metrics.tabBarHeight;
  const pillWidth = inner - capsule - metrics.gap;
  const slot = (pillWidth - 2 - 8) / ITEMS.length;

  const index = ITEMS.indexOf(active);
  const resting = (rtl ? ITEMS.length - 1 - index : index) * slot + 8;
  const x = useSharedValue(resting);

  useEffect(() => {
    x.value = reduced
      ? resting
      : withTiming(resting, { duration: duration.ui, easing: easing.standard });
  }, [resting, reduced]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const pill = useAnimatedStyle(() => {
    const p = searchProgress.value;
    return { opacity: 1 - Math.min(p / 0.5, 1), transform: [{ scale: 1 - 0.06 * p }] };
  });

  // Android resizes the window for the keyboard, so lifting there would move the bar twice.
  const lifts = Platform.OS === 'ios' ? 1 : 0;

  const shell = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          -Math.max(keyboard.height.value - bottom, 0) * searchProgress.value * lifts,
      },
    ],
  }));

  const fieldBox = useAnimatedStyle(() => ({
    width: capsule + searchProgress.value * (inner - capsule),
  }));

  const fieldInner = useAnimatedStyle(() => ({
    opacity: Math.max((searchProgress.value - 0.45) / 0.55, 0),
  }));

  const searchGlyph = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(searchProgress.value / 0.4, 1),
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: metrics.tabBarInset,
          right: metrics.tabBarInset,
          bottom,
          height: metrics.tabBarHeight,
        },
        shell,
      ]}
    >
      <Animated.View
        pointerEvents={searching ? 'none' : 'auto'}
        style={[
          {
            position: 'absolute',
            bottom: 0,
            width: pillWidth,
            height: metrics.tabBarHeight,
            borderRadius: radius.bar,
            ...g.shell,
          },
          insetStart(rtl, 0),
          pill,
        ]}
      >
        <Glass g={g} dark={dark} />

        <View
          style={{ flex: 1, flexDirection: row(rtl), alignItems: 'center', paddingHorizontal: 4 }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 0,
                width: slot - 8,
                height: 44,
                borderRadius: 22,
                backgroundColor: dark ? `${c.ink}1F` : `${c.ink}12`,
              },
              indicator,
            ]}
          />

          {ITEMS.map((k) => (
            <Item
              key={k}
              item={k}
              active={k === active}
              onPress={() => {
                if (k === 'add') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAdd();
                  return;
                }
                onSelect(k);
              }}
              onLongPress={onLongPress ? () => onLongPress(k) : undefined}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            height: metrics.tabBarHeight,
            borderRadius: radius.bar,
            ...g.shell,
          },
          insetEnd(rtl, 0),
          fieldBox,
        ]}
      >
        <Glass g={g} dark={dark} />

        <Pressable
          onPress={onSearchOpen}
          disabled={searching}
          accessibilityRole="button"
          accessibilityLabel={t.search}
          android_ripple={null}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, searchGlyph]}
          >
            <SearchIcon color={c.ink} />
          </Animated.View>
        </Pressable>

        <Animated.View
          pointerEvents={searching ? 'auto' : 'none'}
          style={[
            StyleSheet.absoluteFill,
            { flexDirection: row(rtl), alignItems: 'center', paddingHorizontal: 16, gap: 12 },
            fieldInner,
          ]}
        >
          <SearchIcon size={20} color={c.ink3} />
          {searching ? (
            <TextInput
              autoFocus={!reduced}
              value={query}
              onChangeText={onQuery}
              placeholder={t.search}
              placeholderTextColor={c.ink3}
              selectionColor={c.ink}
              returnKeyType="search"
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              accessibilityLabel={t.search}
              style={{ flex: 1, color: c.ink, padding: 0, fontSize: 17, textAlign: align(rtl) }}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable
            onPress={onSearchClose}
            accessibilityRole="button"
            accessibilityLabel={t.cancel}
            android_ripple={null}
            style={{
              width: metrics.minTap,
              height: metrics.minTap,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon size={20} color={c.ink2} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function Glass({ g, dark }: { g: ReturnType<typeof glass>; dark: boolean }) {
  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: radius.bar - 1, overflow: 'hidden' }]}>
      <BlurView
        intensity={g.blur}
        tint={dark ? 'dark' : 'light'}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: g.tint }]} />
    </View>
  );
}

function Item({
  item,
  active,
  onPress,
  onLongPress,
}: {
  item: ItemKey;
  active: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { c, t, ui, reduced } = useTheme();
  const Icon = icons[item];
  const action = item === 'add';
  const label = action ? t.add : t[item];

  const p = useSharedValue(active || action ? 1 : 0);

  useEffect(() => {
    const target = active || action ? 1 : 0;
    p.value = reduced
      ? target
      : withTiming(target, { duration: duration.ui, easing: easing.standard });
  }, [active, action, reduced]);

  const glyph = useAnimatedStyle(() => ({ opacity: 0.78 + p.value * 0.22 }));

  const tint = useDerivedValue(() => interpolateColor(p.value, [0, 1], [c.ink2, c.ink]));
  const labelStyle = useAnimatedStyle(() => ({ color: tint.value }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={action ? 'button' : 'tab'}
      accessibilityState={action ? undefined : { selected: active }}
      accessibilityLabel={label}
      android_ripple={null}
      style={{
        flex: 1,
        minWidth: metrics.minTap,
        height: metrics.tab,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Animated.View style={glyph}>
          <Icon color={c.ink} />
        </Animated.View>
        <Animated.Text
          numberOfLines={1}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[ui(11, 500), { lineHeight: undefined }, labelStyle]}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}
