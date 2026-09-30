import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { align, insetStart, marginStart, pad, row } from '../lib/rtl';
import { CheckIcon, PlusIcon } from './Icon';

export function Ledger({ children }: { children?: React.ReactNode }) {
  const { c, rtl } = useTheme();
  return (
    <View style={{ position: 'relative', borderTopWidth: 1, borderTopColor: c.rule }}>
      <View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: c.ver, opacity: 0.6 },
          insetStart(rtl, metrics.marginLine),
        ]}
      />
      {children}
    </View>
  );
}

export function LedgerRow({ children }: { children?: React.ReactNode }) {
  const { c, rtl } = useTheme();
  return (
    <View
      style={[
        {
          height: metrics.row,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 14,
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
        },
        pad(rtl, 16, metrics.gutter),
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ label }: { label: string }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={[
        {
          height: metrics.row,
          flexDirection: row(rtl),
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
        },
        pad(rtl, metrics.content, metrics.gutter),
      ]}
    >
      <Text style={[mono(11, 500, 0.1), { color: c.ink3 }]}>{label}</Text>
    </View>
  );
}

export function EmptyRules({ count }: { count: number }) {
  const { c } = useTheme();
  return (
    <View pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ height: metrics.row, borderBottomWidth: 1, borderBottomColor: c.rule }} />
      ))}
    </View>
  );
}

export function Checkbox({
  checked = false,
  circle = false,
  size = metrics.checkbox,
  color,
}: {
  checked?: boolean;
  circle?: boolean;
  size?: number;
  color?: string;
}) {
  const { c } = useTheme();
  const border = color ?? c.ink;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1.5,
        borderColor: border,
        borderRadius: circle ? size / 2 : radius.checkbox,
        backgroundColor: checked ? border : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked && !circle ? <CheckIcon color={c.paper} /> : null}
    </View>
  );
}

export function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export function AddRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { c, ui, rtl } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          height: metrics.row,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
          backgroundColor: pressed ? c.paper2 : 'transparent',
        },
        pad(rtl, 16, metrics.gutter),
      ]}
    >
      <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
        <PlusIcon size={20} color={c.ink3} />
      </View>
      <Text style={[ui(17, 400, 22), { flex: 1, color: c.ink3, textAlign: align(rtl) }, marginStart(rtl, 16)]}>
        {label}
      </Text>
    </Pressable>
  );
}
