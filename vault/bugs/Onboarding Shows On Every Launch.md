# Onboarding Shows On Every Launch

Status: fixed
Found: `src/navigation/Root.tsx` — `Onboarding` was declared first with no `initialRouteName` and no pref consulted
Summary: The welcome screen was the initial route on every cold start, so finishing it meant nothing; an `onboarded` pref now decides where the navigator starts.

## Details
[[Onboarding]] sets the language and then calls `navigation.replace('Main')`, which reads as a one-time setup step. Nothing recorded that it had happened. Because it was simply the first `Stack.Screen` declared and the navigator had no `initialRouteName`, every relaunch put the user back on it — picking a language they had already picked, which is the same complaint as [[Theme Preferences Reset On Every Launch]] arriving from a different direction.

What changed:

- An `onboarded` key alongside the other pref keys in `schema.ts`. No migration; `prefs` is key/value.
- `onboarded: boolean` on the store snapshot, read in the same `Promise.all` as the rest, with a `markOnboarded()` mutator. It is stored as the string `'true'` because `prefs.value` is `TEXT`, and read back as `onboarded === 'true'` rather than any looser truthiness.
- `Root` passes `initialRouteName={onboarded ? 'Main' : 'Onboarding'}`, and the Start button marks the pref before it replaces the route.

### Why Root gates on `loaded`
`initialRouteName` is read once, when the navigator first mounts. Rendering before the pref is known would mean starting on [[Onboarding]] and then correcting, which is the flash the fix exists to remove — so `Root` returns `null` until the store's first snapshot resolves. [[Main Tabs]] and everything under it mount a moment later than they used to.

This is a **new** blocking wait, not an existing one. `loaded` already existed on the store, but nothing waited on it: the UI rendered immediately with `EMPTY` lists and filled in, and `loaded`'s only consumer was holding back the wax stamp on [[Today]]. The prior art is one provider up — `ThemeProvider` gates the same way for the same reason, added with [[Theme Preferences Reset On Every Launch]].

That precedent matters for a second reason. `reload()` set `loaded` after its `await`, so a single rejected query would have left the gate shut forever: a blank screen with no error, no retry and no way out but reinstalling. Before this change that same failure degraded to empty lists. The read is now wrapped so the gate releases either way, matching `ThemeProvider`. Three sequential gates now stand between launch and first paint — fonts in `App`, prefs in `ThemeProvider`, the snapshot in `Root` — and all three release on failure.

The blank moment is paper rather than white: `Shell` sits above `Root` and paints `c.paper`, and the native window is already `#F5F0E6` from `app.json`.

`markOnboarded()` goes through the store's usual `after()` path, so it triggers a reload like every other mutation. `navigation.replace('Main')` runs synchronously first, so there is no race; the late reload flips `onboarded` to `true` after the navigator already mounted, which is inert because `initialRouteName` is not re-read. `loaded` is only ever set true, so the gate never closes again mid-session.

Gating `Root` did mean it re-renders on every store mutation, where before it only re-rendered on a theme change — so `navTheme` is memoised on the palette. Without that, completing a task republished React Navigation's theme context and recreated every `Stack.Screen` element.

### Not covered
[[Onboarding]] is now a registered route with no inbound edge, which this vault treats as a bug elsewhere — see [[Focus Mode Unreachable]], which names the principle, and [[Calendar Overflow Is Unreachable]]. The difference is deliberate here rather than forgotten: the language choice it exists to make is also a row in [[Settings]], and appearance and motion are there too, so nothing it offers is lost. Stating it as a decision rather than claiming it was always intended. A reset row in [[Settings]] would close the loop if the owner wants one; clearing app data is the only route back today.

Two consequences worth knowing:

- Start marks the pref whether or not a language was picked. `OnboardingScreen` only calls `setLang` from its two buttons, so a user who presses Start without touching either keeps the `'en'` default — and, per the paragraph above, does not get asked again. The language row in [[Settings]] is the recovery.
- Existing installs have no `onboarded` row, so the first launch after this change shows the welcome screen exactly once more. Correct, but it is the one visible change a tester would report.

Not verified on a device; the fix rests on the navigator's documented `initialRouteName` behaviour and the pref round trip.

## Related
- Page: [[Onboarding]], [[Main Tabs]], [[Settings]], [[Today]]
- Features: [[Offline First Local Store]], [[In-App RTL and Arabic Typography]], [[Animated Page Transitions]]
- Bugs: [[Theme Preferences Reset On Every Launch]]
