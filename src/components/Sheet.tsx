import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { row } from '../lib/rtl';

export function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { c, t, reduced } = useTheme();
  const inset = useSafeAreaInsets();

  return (
    <Modal transparent visible animationType={reduced ? 'none' : 'slide'} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t.cancel}
          style={[StyleSheet.absoluteFill, { backgroundColor: c.ink, opacity: 0.28 }]}
        />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            borderTopWidth: 1,
            borderTopColor: c.rule,
            paddingTop: 14,
            paddingBottom: inset.bottom + 16,
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.rule,
              alignSelf: 'center',
            }}
          />
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function SheetRow({
  children,
  onPress,
  label,
}: {
  children: React.ReactNode;
  onPress: () => void;
  label: string;
}) {
  const { c, rtl, unit } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: unit,
        flexDirection: row(rtl),
        alignItems: 'center',
        gap: metrics.gap,
        paddingHorizontal: metrics.gutter,
        borderTopWidth: 1,
        borderTopColor: c.rule,
        backgroundColor: pressed ? c.paper2 : 'transparent',
      })}
    >
      {children}
    </Pressable>
  );
}

export function SheetButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  const { c, ui } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        height: 56,
        borderRadius: radius.card,
        backgroundColor: secondary ? 'transparent' : c.ink,
        borderWidth: secondary ? 1 : 0,
        borderColor: c.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[ui(17, 500), { lineHeight: undefined, color: secondary ? c.ink : c.paper }]}>
        {label}
      </Text>
    </Pressable>
  );
}
