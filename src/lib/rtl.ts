import { FlexStyle, TextStyle, ViewStyle } from 'react-native';

export const row = (rtl: boolean): FlexStyle['flexDirection'] => (rtl ? 'row-reverse' : 'row');

export const align = (rtl: boolean): TextStyle['textAlign'] => (rtl ? 'right' : 'left');

export function pad(rtl: boolean, start: number, end: number): FlexStyle {
  return rtl ? { paddingLeft: end, paddingRight: start } : { paddingLeft: start, paddingRight: end };
}

export function insetStart(rtl: boolean, v: number): FlexStyle {
  return rtl ? { right: v } : { left: v };
}

export function insetEnd(rtl: boolean, v: number): FlexStyle {
  return rtl ? { left: v } : { right: v };
}

export function marginStart(rtl: boolean, v: number): FlexStyle {
  return rtl ? { marginRight: v } : { marginLeft: v };
}

export function borderStart(rtl: boolean, width: number, color: string): ViewStyle {
  return rtl
    ? { borderRightWidth: width, borderRightColor: color }
    : { borderLeftWidth: width, borderLeftColor: color };
}
