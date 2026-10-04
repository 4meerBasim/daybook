# Biometric app lock

Status: shipped
Summary: An optional Face ID / fingerprint gate that locks the app on cold launch and when it returns from the background.

## Details
Built on `expo-local-authentication`. `src/lib/biometrics.ts` wraps `hasHardwareAsync` + `isEnrolledAsync` (`isBiometricAvailable`) and `authenticateAsync` (`authenticate`), treating web as unavailable/unlocked and never throwing. The `appLockEnabled` boolean pref lives in the settings KV store (`src/lib/db.ts` `JournalPrefs`, hydrated in `loadSnapshot`, set via `setSetting` from `src/state/store.tsx`). A Security group on [[Settings]] holds the App lock `ToggleRow`: enabling first verifies hardware + enrollment and runs a confirming `authenticateAsync`, reverting and showing the `appLockUnavailable` helper on web / no-hardware / cancel. `src/components/LockGate.tsx` wraps the navigator in `App.tsx`: it shows a themed lock overlay with an Unlock action on cold launch and whenever `AppState` returns to `active` after `background`, and never locks when the pref is off or on web.

## Related
- Page: [[Settings]], [[Main Tabs]]
- Features: [[Persistence layer]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
