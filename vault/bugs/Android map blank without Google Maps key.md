# Android map blank without Google Maps key

Status: not-fixed
Found: src/screens/TimelineMapScreen.tsx (MapView default provider) + app.config.js
Summary: On Android the Timeline map tiles render blank until a Google Maps API key is supplied.

## Details
The Timeline map uses `react-native-maps` with the default provider (no `PROVIDER_GOOGLE` forced). On Android, Google Maps needs an API key; it is wired through `app.config.js` from the `GOOGLE_MAPS_API_KEY` env var (`android.config.googleMaps.apiKey`) and is deliberately not hardcoded, so without that env var set at build time the map renders blank. iOS (Apple Maps) is unaffected. Left unfixed on purpose — the key is deployment configuration, not code.

## Related
- Feature: [[Timeline and map view]]
- Page: [[Timeline and Map]]
