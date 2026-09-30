import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

type Props = { size?: number; color: string };

const stroke = {
  fill: 'none' as const,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function PenIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" stroke={color} {...stroke} />
      <Path d="M13 7l3 3" stroke={color} {...stroke} />
    </Svg>
  );
}

export function PageIcon({ size = 24, color, paper }: Props & { paper?: string }) {
  if (paper) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M6 3h9l4 4v14H6z" fill={color} />
        <Path d="M9 11h7M9 15h7" stroke={paper} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 3h9l4 4v14H6z" stroke={color} {...stroke} />
      <Path d="M9 11h7M9 15h7" stroke={color} {...stroke} />
    </Svg>
  );
}

export function CalendarIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8h16v12H4z" stroke={color} {...stroke} />
      <Path d="M4 12h16M8 5v3M16 5v3" stroke={color} {...stroke} />
    </Svg>
  );
}

export function ClockIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8} stroke={color} fill="none" strokeWidth={1.5} />
      <Path d="M12 8v4l3 2" stroke={color} {...stroke} />
    </Svg>
  );
}

export function TrayIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 13l3-8h12l3 8v6H3z" stroke={color} {...stroke} />
      <Path d="M3 13h5l2 3h4l2-3h5" stroke={color} {...stroke} />
    </Svg>
  );
}

export function SearchIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={6} stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M20 20l-4.5-4.5" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} {...stroke} />
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} stroke={color} fill="none" strokeWidth={1.5} />
      <Path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke={color} {...stroke} />
    </Svg>
  );
}

export function CheckIcon({ width = 12, height = 10, color }: { width?: number; height?: number; color: string }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 10">
      <Path
        d="M1 5.5l3.2 3L11 1.5"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronBackIcon({ size = 24, color, flip = false }: Props & { flip?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Path d="M15 5l-7 7 7 7" stroke={color} {...stroke} />
    </Svg>
  );
}

export function EllipsisIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={12} r={1.8} fill={color} />
      <Circle cx={12} cy={12} r={1.8} fill={color} />
      <Circle cx={19} cy={12} r={1.8} fill={color} />
    </Svg>
  );
}

export function PaperclipIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 12l7-7a3.5 3.5 0 015 5l-9 9a5 5 0 01-7-7l8-8"
        stroke={color}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FlagIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 4v16M5 4h11l-2 4 2 4H5" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function HashIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 4L7 20M17 4l-2 16M4 9h17M3 15h17" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function DragHandleIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 8h12M6 12h12M6 16h12" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function StreakTallyIcon({ color, flip = false }: { color: string; flip?: boolean }) {
  return (
    <Svg width={30} height={14} viewBox="0 0 30 14" style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Path d="M3 1v12M8 1v12M13 1v12M18 1v12M1 12L20 2" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M25 1v12M29 1v12" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
