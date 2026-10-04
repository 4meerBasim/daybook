# Expo Go crashes on launch from native-only modules

Status: fixed
Found: reported by user — "Runtime not ready" plus expo-notifications Android push error in Expo Go
Fixed: `src/lib/notifications.ts` skips loading expo-notifications in Expo Go on Android (via expo-constants `ExecutionEnvironment.StoreClient`); `src/lib/auth.ts` and `src/widget/refresh.tsx` require `@react-native-google-signin/google-signin` and `react-native-android-widget` lazily inside try/catch.
Summary: Opening the app in Expo Go on Android crashed at startup because modules missing from Expo Go were imported at the top level.

## Details
Expo Go (SDK 53+) no longer includes expo-notifications on Android, and never includes Google sign-in or the widget module. A top-level import threw before the JS runtime was ready. In Expo Go, reminders, Google sign-in and the widget are now silently unavailable; a development build (`npx expo run:android`) has all of them.

## Related
- Page: [[Settings]]
- Features: [[Local reminders]], [[Account sign-in (Google and Apple)]], [[Home-screen widget]]
