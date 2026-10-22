import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TextStyle, useWindowDimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { DARK, LIGHT, Palette } from './palette';
import { displayFamily, monoFamily, uiFamily, Weight } from './fonts';
import { rulingUnit } from './tokens';
import { AR, EN, Strings } from '../i18n/strings';
import { APPEARANCE, LANG, MOTION } from '../db/schema';
import { selectPref, setPref } from '../db/queries';

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
  unit: number;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  children,
  systemDark = false,
}: {
  children: React.ReactNode;
  systemDark?: boolean;
}) {
  const db = useSQLiteContext();
  const [lang, setLangState] = useState<Lang>('en');
  const [appearance, setAppearanceState] = useState<Appearance>('light');
  const [motion, setMotionState] = useState<Motion>('full');
  const [loaded, setLoaded] = useState(false);
  const { fontScale } = useWindowDimensions();

  useEffect(() => {
    const load = async () => {
      const [savedLang, savedAppearance, savedMotion] = await Promise.all([
        selectPref(db, LANG),
        selectPref(db, APPEARANCE),
        selectPref(db, MOTION),
      ]);
      if (savedLang) setLangState(savedLang as Lang);
      if (savedAppearance) setAppearanceState(savedAppearance as Appearance);
      if (savedMotion) setMotionState(savedMotion as Motion);
      setLoaded(true);
    };
    load();
  }, [db]);

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
      setLang: (l) => {
        setLangState(l);
        setPref(db, LANG, l);
      },
      setAppearance: (a) => {
        setAppearanceState(a);
        setPref(db, APPEARANCE, a);
      },
      setMotion: (m) => {
        setMotionState(m);
        setPref(db, MOTION, m);
      },
      display,
      ui,
      mono,
      chipPadding: ar ? 12 : 10,
      unit: rulingUnit(fontScale),
    };
  }, [db, lang, appearance, motion, systemDark, fontScale]);

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
