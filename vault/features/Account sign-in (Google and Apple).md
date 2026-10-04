# Account sign-in (Google and Apple)

Status: shipped
Summary: Real Supabase Auth via Google and Apple ID-token sign-in, replacing the anonymous per-device owner id so cloud sync is scoped to a genuine account across devices.

## Details
Replaces the anonymous on-device owner stand-in with real accounts. Sign-in uses native OpenID ID-token flows handed to `supabase.auth.signInWithIdToken`:
- Google via `@react-native-google-signin/google-signin` (v16): `GoogleSignin.configure({ webClientId, iosClientId })` from env, `signIn()` → `response.data.idToken` → `signInWithIdToken({ provider: 'google', token })`.
- Apple via `expo-apple-authentication` (iOS only): `AppleAuthentication.signInAsync` → `credential.identityToken` → `signInWithIdToken({ provider: 'apple', token })`.

`src/lib/auth.ts` wraps both plus `signOut`, `getCurrentSession`, `onAuthChange`, `isGoogleConfigured()` and `isAppleAvailable()`. Every entry point no-ops gracefully when Supabase is unconfigured or the client ids are unset (buttons hidden, calls short-circuit, cancellation is swallowed).

Sessions persist: `src/lib/supabase.ts` now builds the client with `storage: AsyncStorage`, `persistSession: true`, `autoRefreshToken: true`. `App.tsx` mounts an `AuthSync` component that restores the session on launch (`getCurrentSession`), subscribes to `onAuthChange`, pushes identity into the store via `setSession`, and drives token auto-refresh off `AppState`.

Owner scoping: the store's `userId` / `userEmail` hold the signed-in identity; `ensureOwnerId()` now returns `userId ?? ''` (the Supabase `auth.uid()`), which is what sync and shared-lists stamp as `owner`. RLS (`supabase/schema.sql`) enforces `owner = auth.uid()`. On first sign-in (or switching accounts) `setSession` resets `lastSyncAt` to 0 so all local rows re-push under the authenticated owner — migrating previously anonymous-owned data forward; `onSignIn` in Settings also kicks a full `since: 0` push when sync is enabled.

Config: client ids come from `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (see `.env.example`). `app.json` adds the `expo-apple-authentication` plugin and `ios.usesAppleSignIn`; `app.config.js` conditionally adds the `@react-native-google-signin/google-signin` plugin with an `iosUrlScheme` derived from the reversed iOS client id, and omits it (so Android prebuild still succeeds) when unset. Needs a dev/EAS build; providers must be enabled in the Supabase dashboard. Not runtime-tested against a live project.

UI: sign-in / sign-out rows live in [[Settings]] under the Cloud sync group (EN + MSA Arabic, RTL-safe) — Google and (iOS) Apple buttons when signed out, the account email + Sign out when signed in.

## Related
- Page: [[Settings]]
- Features: [[Cloud sync (Supabase)]], [[Real-time shared lists (Supabase)]]
