# Theme Preferences Reset On Every Launch

Status: fixed
Found: `src/theme/ThemeProvider.tsx` — `lang`, `appearance` and `motion` were plain `useState`, and the provider mounted outside `SQLiteProvider`
Summary: Language, appearance and reduced motion were in-memory only, so every relaunch threw the user back to English, light paper and full motion; they now read and write the `prefs` table.

## Details
The three rows in [[Settings]] that actually did something were the three whose choices did not survive the app being closed. An Arabic-reading user re-picked their language every single launch — see [[In-App RTL and Arabic Typography]].

The cause was structural rather than an oversight: `ThemeProvider` sat *outside* `SQLiteProvider` in `App.tsx`, so it had no database to read. The storage it needed already existed — [[Offline First Local Store]]'s `prefs` table, with `selectPref` / `setPref`, which [[Profile]]'s display name was already using as the single precedent.

What changed:

- `App.tsx` now nests `ThemeProvider` *inside* `SQLiteProvider`, so it can call `useSQLiteContext()`. `GestureHandlerRootView` moved out to the root, where it keeps gestures above everything, and `Shell` became the plain themed `View` it always effectively was.
- Three pref keys sit next to `DISPLAY_NAME` in `schema.ts`: `lang`, `appearance`, `motion`. No migration — `prefs` is a key/value table, so new keys cost nothing.
- `ThemeProvider` reads all three in one `Promise.all` on mount, and each setter writes through as it sets state.

### Why it gates render
The provider returns `null` until the read resolves. Without that gate the tree mounts with the defaults and then flips — an Arabic user would watch a frame of English, which is worse than the blank moment. The read is wrapped so the gate releases even if it fails, because a provider that returns `null` forever is a blank app with nothing but a console warning to show for it; a failed read degrades to the old in-memory behaviour instead.

The root `GestureHandlerRootView` paints `LIGHT.paper` underneath during that moment. It has to match the *default* appearance, not the system one: `app.json` already sets `backgroundColor: "#F5F0E6"`, which is byte-identical to `LIGHT.paper`, so the native window is cream before any JavaScript runs. Painting the root from `systemDark` would therefore insert a dark frame *between two cream frames* on a dark-system device — the native window, then the root, then `Shell` resolving to light because that is the default. The flash it looked like it was avoiding is one it would have created.

The gate is brief: `SQLiteProvider` already withholds its children until the database is open — `openDatabaseWithInitAsync` awaits `onInit`, so `migrate` and `seedFirstRun` finish before `ThemeProvider` mounts and `prefs` is guaranteed to exist. This adds three key/value reads on top of a wait the app was already doing. They do not actually run in parallel despite the `Promise.all`, since expo-sqlite serialises statements per connection; at sub-millisecond each that is not worth collapsing into one `WHERE key IN (...)`.

### Still open: what a fresh install should default to
`ThemeProvider` defaults `appearance` to `'light'`, so a fresh install ignores a dark-system device until the user picks Auto themselves. Persisting the choice makes that initial value matter more rather than less.

This is *not* a disagreement with `app.json`'s `userInterfaceStyle: "automatic"`, which an earlier draft of this note claimed. That setting is what makes `useColorScheme()` report the real system scheme at all — it is the mechanism the `auto` segment depends on, not a competing default. Setting it to `"light"` would silently break the Auto option. The two are different knobs and both are currently correct.

What is left open is only the in-app default: light-first is a plausible aesthetic decision for a paper ledger rather than a bug, so it is the owner's call. Switching it to `'auto'` would also let the root loading colour follow `systemDark` honestly, which it cannot today. See [[Light and Dark Paper Palettes]].

[[Reduced Motion Mode]] gains persistence here but is still a manual toggle that never consults the OS — see [[Stack Screens Ignore The Bottom Safe Area]] for the other place this app reads a system value it should and [[Reduced Motion Mode]] for the gap itself.

Not verified on a device; the fix rests on the provider order and the `prefs` round trip, both read rather than run.

## Related
- Page: [[Settings]], [[Profile]], [[Onboarding]], [[Main Tabs]]
- Features: [[Offline First Local Store]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Reduced Motion Mode]]
