import React, { createContext, useContext, useMemo, useState } from 'react';
import { TextStyle } from 'react-native';
import { DARK, LIGHT, Palette } from './palette';
import { displayFamily, monoFamily, uiFamily, Weight } from './fonts';
import { AR, EN, Strings } from '../i18n/strings';

export type Lang = 'en' | 'ar';
export type Appearance = 'light' | 'dark' | 'auto';
export type Motion = 'full' | 'reduced';

type DisplayOpts = { weight?: Weight; italic?: boolean; lineHeight?: number };

export type Theme = {
  c: Palette;
  t: Strings;
  lang: Lang;
  ar: boolean;
  dark: boolean;
  appearance: Appearance;
  motion: Motion;
  reduced: boolean;
  rtl: boolean;
  setLang: (l: Lang) => void;
  setAppearance: (a: Appearance) => void;
  setMotion: (m: Motion) => void;
  display: (size: number, opts?: DisplayOpts) => TextStyle;
  ui: (size: number, weight?: Weight, lineHeight?: number) => TextStyle;
  mono: (size: number, weight?: Weight, tracking?: number, label?: boolean) => TextStyle;
  chipPadding: number;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  children,
  systemDark = false,
}: {
  children: React.ReactNode;
  systemDark?: boolean;
}) {
  const [lang, setLang] = useState<Lang>('en');
  const [appearance, setAppearance] = useState<Appearance>('light');
  const [motion, setMotion] = useState<Motion>('full');

  const value = useMemo<Theme>(() => {
    const ar = lang === 'ar';
    const dark = appearance === 'auto' ? systemDark : appearance === 'dark';
    const c = dark ? DARK : LIGHT;

    const display = (size: number, opts: DisplayOpts = {}): TextStyle => {
      const weight = opts.weight ?? 500;
      const scaled = ar ? Math.round(size * 0.9) : size;
      return {
        fontFamily: displayFamily(ar, weight, !!opts.italic),
        fontSize: scaled,
        lineHeight: ar ? Math.round(scaled * 1.35) : opts.lineHeight,
        letterSpacing: ar ? 0 : scaled * -0.02,
      };
    };

    const ui = (size: number, weight: Weight = 400, lineHeight?: number): TextStyle => ({
      fontFamily: uiFamily(ar, weight),
      fontSize: size,
      lineHeight: ar ? Math.round(size * 1.53) : lineHeight,
    });

    const mono = (size: number, weight: Weight = 500, tracking = 0, label = false): TextStyle => ({
      fontFamily: label && ar ? uiFamily(ar, weight) : monoFamily(weight),
      fontSize: size,
      letterSpacing: ar ? 0 : tracking * size,
    });

    return {
      c,
      t: ar ? AR : EN,
      lang,
      ar,
      dark,
      appearance,
      motion,
      reduced: motion === 'reduced',
      rtl: ar,
      setLang,
      setAppearance,
      setMotion,
      display,
      ui,
      mono,
      chipPadding: ar ? 12 : 10,
    };
  }, [lang, appearance, motion, systemDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
