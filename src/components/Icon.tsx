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

export function LockIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 11h12v9H6z" stroke={color} {...stroke} />
      <Path d="M8 11V8a4 4 0 018 0v3" stroke={color} {...stroke} />
      <Circle cx={12} cy={15} r={1.4} fill={color} />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" stroke={color} {...stroke} />
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

export function BookIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 4h9a3 3 0 013 3v13H8a3 3 0 00-3 3z" stroke={color} {...stroke} />
      <Path d="M17 4h2v16" stroke={color} {...stroke} />
    </Svg>
  );
}

export function LeafIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 4C9 4 4 10 4 20c10 0 16-5 16-16z" stroke={color} {...stroke} />
      <Path d="M4 20C8 14 12 11 17 9" stroke={color} {...stroke} />
    </Svg>
  );
}

export function StarIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L4 9.3l6-.7z" stroke={color} {...stroke} />
    </Svg>
  );
}

export function HeartIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20S4 15 4 9a4 4 0 018-1 4 4 0 018 1c0 6-8 11-8 11z" stroke={color} {...stroke} />
    </Svg>
  );
}

export function SunIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={4} stroke={color} fill="none" strokeWidth={1.5} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke={color} {...stroke} />
    </Svg>
  );
}

export function MoonIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 14a8 8 0 01-10-10 8 8 0 1010 10z" stroke={color} {...stroke} />
    </Svg>
  );
}

export function MapPinIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" stroke={color} {...stroke} />
      <Circle cx={12} cy={10} r={2.5} stroke={color} fill="none" strokeWidth={1.5} />
    </Svg>
  );
}

export function TimelineIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 3v18" stroke={color} {...stroke} />
      <Circle cx={6} cy={7} r={2} stroke={color} fill="none" strokeWidth={1.5} />
      <Circle cx={6} cy={16} r={2} stroke={color} fill="none" strokeWidth={1.5} />
      <Path d="M10 7h10M10 16h7" stroke={color} {...stroke} />
    </Svg>
  );
}

export function CameraIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8h3l2-2.5h6L17 8h3v11H4z" stroke={color} {...stroke} />
      <Circle cx={12} cy={13} r={3.3} stroke={color} fill="none" strokeWidth={1.5} />
    </Svg>
  );
}

export function MicIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0v-5A2.5 2.5 0 0 1 12 4z" stroke={color} {...stroke} />
      <Path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke={color} {...stroke} />
    </Svg>
  );
}

export function ImageIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 5h16v14H4z" stroke={color} {...stroke} />
      <Path d="M4 16l4.5-4.5 3 3 3.5-3.5 5 5" stroke={color} {...stroke} />
      <Circle cx={8.5} cy={9} r={1.4} stroke={color} fill="none" strokeWidth={1.5} />
    </Svg>
  );
}

export function PlayIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5.5l11 6.5-11 6.5z" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5h3v14H8zM13 5h3v14h-3z" fill={color} />
    </Svg>
  );
}

export function TrashIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12" stroke={color} {...stroke} />
    </Svg>
  );
}

export const JOURNAL_ICON_KEYS = ['book', 'leaf', 'star', 'heart', 'sun', 'moon'] as const;

export type JournalIconKey = (typeof JOURNAL_ICON_KEYS)[number];

export function JournalIcon({
  name,
  size = 24,
  color,
}: {
  name: JournalIconKey;
  size?: number;
  color: string;
}) {
  switch (name) {
    case 'leaf':
      return <LeafIcon size={size} color={color} />;
    case 'star':
      return <StarIcon size={size} color={color} />;
    case 'heart':
      return <HeartIcon size={size} color={color} />;
    case 'sun':
      return <SunIcon size={size} color={color} />;
    case 'moon':
      return <MoonIcon size={size} color={color} />;
    default:
      return <BookIcon size={size} color={color} />;
  }
}
