import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular';
import { Newsreader_400Regular_Italic } from '@expo-google-fonts/newsreader/400Regular_Italic';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { Newsreader_500Medium_Italic } from '@expo-google-fonts/newsreader/500Medium_Italic';
import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { InstrumentSans_400Regular } from '@expo-google-fonts/instrument-sans/400Regular';
import { InstrumentSans_500Medium } from '@expo-google-fonts/instrument-sans/500Medium';
import { InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans/600SemiBold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { NotoNaskhArabic_400Regular } from '@expo-google-fonts/noto-naskh-arabic/400Regular';
import { NotoNaskhArabic_500Medium } from '@expo-google-fonts/noto-naskh-arabic/500Medium';
import { NotoNaskhArabic_600SemiBold } from '@expo-google-fonts/noto-naskh-arabic/600SemiBold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';

export const fontAssets = {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_500Medium_Italic,
  Newsreader_600SemiBold,
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_500Medium,
  NotoNaskhArabic_600SemiBold,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
};

export type Weight = 400 | 500 | 600;

const LATIN_DISPLAY: Record<string, string> = {
  '400': 'Newsreader_400Regular',
  '500': 'Newsreader_500Medium',
  '600': 'Newsreader_600SemiBold',
  '400i': 'Newsreader_400Regular_Italic',
  '500i': 'Newsreader_500Medium_Italic',
};

const ARABIC_DISPLAY: Record<string, string> = {
  '400': 'NotoNaskhArabic_400Regular',
  '500': 'NotoNaskhArabic_500Medium',
  '600': 'NotoNaskhArabic_600SemiBold',
};

const LATIN_UI: Record<string, string> = {
  '400': 'InstrumentSans_400Regular',
  '500': 'InstrumentSans_500Medium',
  '600': 'InstrumentSans_600SemiBold',
};

const ARABIC_UI: Record<string, string> = {
  '400': 'IBMPlexSansArabic_400Regular',
  '500': 'IBMPlexSansArabic_500Medium',
  '600': 'IBMPlexSansArabic_600SemiBold',
};

const MONO: Record<string, string> = {
  '400': 'JetBrainsMono_400Regular',
  '500': 'JetBrainsMono_500Medium',
};

export function displayFamily(ar: boolean, weight: Weight, italic: boolean) {
  if (ar) return ARABIC_DISPLAY[String(weight)] ?? ARABIC_DISPLAY['400'];
  const key = italic && weight !== 600 ? `${weight}i` : String(weight);
  return LATIN_DISPLAY[key] ?? LATIN_DISPLAY['400'];
}

export function uiFamily(ar: boolean, weight: Weight) {
  const table = ar ? ARABIC_UI : LATIN_UI;
  return table[String(weight)] ?? table['400'];
}

export function monoFamily(weight: Weight) {
  return MONO[String(weight)] ?? MONO['400'];
}
