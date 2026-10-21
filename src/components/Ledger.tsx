import React, { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { insetStart, pad, row } from '../lib/rtl';
import { CheckIcon } from './Icon';

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

export function useRuling() {
  const { unit } = useTheme();
  const [units, setUnits] = useState(1);

  const onContentLayout = (e: LayoutChangeEvent) => {
    const next = Math.max(1, Math.ceil(e.nativeEvent.layout.height / unit));
    setUnits((prev) => (prev === next ? prev : next));
  };

  return { height: unit * units, grown: units > 1, onContentLayout };
}

export function rowContent(rtl: boolean, start: number) {
  return [
    {
      flexDirection: row(rtl),
      alignItems: 'center' as const,
      gap: metrics.gap,
      paddingVertical: metrics.rowPad,
    },
    pad(rtl, start, metrics.gutter),
  ];
}

export function LedgerRow({ children, start = 16 }: { children?: React.ReactNode; start?: number }) {
  const { c, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  return (
    <View
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, start)}>
        {children}
      </View>
    </View>
  );
}

export function SectionLabel({ label }: { label: string }) {
  const { c, mono, rtl, unit } = useTheme();
  return (
    <View
      style={[
        {
          minHeight: unit,
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
  const { c, unit } = useTheme();
  return (
    <View pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ height: unit, borderBottomWidth: 1, borderBottomColor: c.rule }} />
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
        backgroundColor: checked ? c.ink : 'transparent',
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
