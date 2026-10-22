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

The blank moment is paper rather than white: `Shell` sits above `Root` and paints `c.paper`, and the native window is already `#F5F0E6` from `app.json`. It is also the same wait [[Offline First Local Store]] was already doing — `loaded` existed and was only being used to hold back the wax stamp on [[Today]].

`markOnboarded()` goes through the store's usual `after()` path, so it triggers a reload like every other mutation. That cannot re-trigger the navigator, since `initialRouteName` is not re-read, and `loaded` is only ever set true, so the gate never closes again mid-session.

### Not covered
There is no way to see [[Onboarding]] again once it is done — no reset in [[Settings]]. That is a product decision rather than an oversight, and the screen is still reachable by clearing app data.

Not verified on a device; the fix rests on the navigator's documented `initialRouteName` behaviour and the pref round trip.

## Related
- Page: [[Onboarding]], [[Main Tabs]], [[Settings]], [[Today]]
- Features: [[Offline First Local Store]], [[In-App RTL and Arabic Typography]], [[Animated Page Transitions]]
- Bugs: [[Theme Preferences Reset On Every Launch]]
