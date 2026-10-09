import { ViewStyle } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { Palette } from './palette';

export const radius = {
  checkbox: 4,
  chip: 6,
  card: 12,
  sheet: 20,
  bar: 32,
  pen: 9999,
} as const;

export const maxFontSizeMultiplier = 1.6;

export const metrics = {
  ruling: 56,
  gutter: 20,
  marginLine: 52,
  checkbox: 22,
  gap: 12,
  rowPad: 12,
  content: 66,
  tabBar: 84,
  tabBarHeight: 64,
  tabBarInset: 12,
  tabBarMinBottom: 12,
  tabBarLift: 16,
  pen: 56,
  tab: 56,
  minTap: 44,
  avatar: 48,
  labelColumn: 88,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

export function rulingUnit(fontScale: number): number {
  const scale = Math.min(fontScale, maxFontSizeMultiplier);
  if (scale >= 1.3) return 72;
  if (scale >= 1.2) return 64;
  return metrics.ruling;
}

export const duration = {
  ui: 180,
  page: 320,
  stroke: 420,
  dry: 900,
} as const;

export const easing = {
  standard: Easing.bezier(0.2, 0.8, 0.2, 1),
  ink: Easing.bezier(0.4, 0, 0.2, 1),
};

export function glass(c: Palette, dark: boolean): {
  blur: number;
  tint: string;
  shell: ViewStyle;
} {
  return {
    blur: dark ? 48 : 56,
    tint: dark ? `${c.paper2}B0` : `${c.paper2}A8`,
    shell: { borderWidth: 1, borderColor: dark ? `${c.ink}26` : `${c.rule}CC` },
  };
}
