import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { Strings } from '../i18n/strings';

export type EntryContext = {
  placeName: string | null;
  lat: number | null;
  lng: number | null;
  tempC: number | null;
  weatherCode: number | null;
  capturedAt: number;
};

const WEATHER_FETCH_TIMEOUT_MS = 6000;

type CurrentWeather = { tempC: number | null; weatherCode: number | null };

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const place = results[0];
    if (!place) return null;
    return place.city ?? place.district ?? place.subregion ?? place.region ?? place.name ?? null;
  } catch {
    return null;
  }
}

async function fetchCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
  const fallback: CurrentWeather = { tempC: null, weatherCode: null };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEATHER_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`,
      { signal: controller.signal },
    );
    if (!response.ok) return fallback;
    const data = (await response.json()) as {
      current?: { temperature_2m?: unknown; weather_code?: unknown };
    };
    const temperature = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    return {
      tempC: typeof temperature === 'number' ? Math.round(temperature) : null,
      weatherCode: typeof code === 'number' ? code : null,
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export async function captureContext(): Promise<EntryContext> {
  const capturedAt = Date.now();
  const empty: EntryContext = {
    placeName: null,
    lat: null,
    lng: null,
    tempC: null,
    weatherCode: null,
    capturedAt,
  };
  if (Platform.OS === 'web') return empty;
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return empty;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const placeName = await reverseGeocode(lat, lng);
    const weather = await fetchCurrentWeather(lat, lng);
    return {
      placeName,
      lat,
      lng,
      tempC: weather.tempC,
      weatherCode: weather.weatherCode,
      capturedAt,
    };
  } catch {
    return empty;
  }
}

export function weatherLabel(code: number | null, t: Strings): string {
  if (code === null) return t.wxUnknown;
  switch (code) {
    case 0:
      return t.wxClear;
    case 1:
    case 2:
      return t.wxPartly;
    case 3:
      return t.wxCloudy;
    case 45:
    case 48:
      return t.wxFog;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return t.wxDrizzle;
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return t.wxRain;
    case 80:
    case 81:
    case 82:
      return t.wxShowers;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return t.wxSnow;
    case 95:
    case 96:
    case 99:
      return t.wxThunder;
    default:
      return t.wxUnknown;
  }
}

export function formatWeather(tempC: number | null, code: number | null, t: Strings): string {
  if (tempC !== null && code !== null) return `${tempC}° · ${weatherLabel(code, t)}`;
  if (tempC !== null) return `${tempC}°`;
  if (code !== null) return weatherLabel(code, t);
  return '';
}
