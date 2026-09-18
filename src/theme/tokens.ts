import { ViewStyle } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { Palette } from './palette';

export const radius = {
  checkbox: 4,
  chip: 6,
  card: 12,
  sheet: 20,
  pen: 9999,
} as const;

export const metrics = {
  row: 56,
  gutter: 20,
  marginLine: 52,
  checkbox: 22,
  content: 66,
  tabBar: 84,
  pen: 56,
  labelColumn: 88,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

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

export function penShadow(c: Palette, dark: boolean): ViewStyle {
  return dark
    ? { borderWidth: 1, borderColor: `${c.ink}1F` }
    : {
        shadowColor: c.ink,
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      };
}

export const maxFontSizeMultiplier = 1.6;
