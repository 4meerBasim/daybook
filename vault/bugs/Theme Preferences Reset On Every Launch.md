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
The provider returns `null` until the read resolves. Without that gate the tree mounts with the defaults and then flips — an Arabic user would watch a frame of English, which is worse than the blank moment. The root `GestureHandlerRootView` paints paper underneath during that moment, chosen from `systemDark`, so a dark-system device does not flash cream.

The gate is brief: `SQLiteProvider` already withholds its children until the database is open, so this adds one local key/value read on top of a wait the app was already doing.

### Still open: what a fresh install should default to
`ThemeProvider` defaults `appearance` to `'light'` while `app.json` declares `userInterfaceStyle: "automatic"`. Those disagree, and persisting the choice makes the *initial* value matter more rather than less. Deliberately left alone: for a paper ledger, defaulting to light is a plausible aesthetic decision rather than a bug, and it may be `app.json` that is wrong. The owner should settle which one gives. See [[Light and Dark Paper Palettes]].

[[Reduced Motion Mode]] gains persistence here but is still a manual toggle that never consults the OS — see [[Stack Screens Ignore The Bottom Safe Area]] for the other place this app reads a system value it should and [[Reduced Motion Mode]] for the gap itself.

Not verified on a device; the fix rests on the provider order and the `prefs` round trip, both read rather than run.

## Related
- Page: [[Settings]], [[Profile]], [[Onboarding]], [[Main Tabs]]
- Features: [[Offline First Local Store]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Reduced Motion Mode]]
