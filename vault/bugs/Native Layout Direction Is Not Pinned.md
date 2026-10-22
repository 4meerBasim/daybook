# Native Layout Direction Is Not Pinned

Status: fixed
Found: no `I18nManager` call and no `direction:` style anywhere in `src/`, `App.tsx`, `index.ts` or `app.json`
Summary: [[In-App RTL and Arabic Typography]] mirrors layout in styles and assumes the native layout direction stays LTR, but nothing enforced that — on an RTL device the native side mirrored on top of the app's own mirroring, flipping rows and swapping every physical left/right edge. `index.ts` now sets `allowRTL(false)` and `forceRTL(false)`.

## Details
The app's mirroring model is style-level: `src/lib/rtl.ts` returns physical values (`left`/`right`, `marginLeft`/`marginRight`) and `row(rtl)` returns `'row-reverse'` for Arabic. `rtl` comes from the in-app `lang`, so switching language in [[Settings]] mirrors the UI without a reload. That is deliberate, and it is what makes the language toggle instant.

What it assumes is that the native layout direction is LTR. Nothing in this project enforced that.

### How wide the exposure actually was
Wider than this note first claimed, and in two ways it originally got backwards.

**Physical edges were not safe.** `swapLeftAndRightInRTL` defaults to **true** on both platforms, and under an RTL direction React Native rewrites every node's `Left` edge to `Start` and `Right` to `End` — for position, padding, margin and border, plus border colours and radii — which then resolve against the RTL direction. So `insetStart`, `insetEnd`, `pad`, `marginStart` and `borderStart` were all flipping too, not just `flexDirection`. The only genuinely unaffected helper is `align(rtl)`: `textAlign` is not part of that swap.

**It was active, not latent.** `justifyContent: 'flex-end'` is main-axis, so inside a `flexDirection: row(rtl)` container it is direction-relative horizontal placement — and it had shipped in five places: `ProjectScreen.tsx:194`, `SwipeableRow.tsx:145` and `:166`, and `SwipeStatesScreen.tsx:134` and `:158`. On an RTL device the swipe action panes packed their labels against the wrong edge in *both* app languages. (Two other `flex-end` uses, in `CalendarScreen` and `Sheet`, sit in column containers where the property is vertical, so they were fine.)

So the exposed set is anything **direction-relative** — `flexDirection`, `justifyContent` on a row, and `alignSelf`/`alignItems` if ever used for horizontal placement — *plus* every physical edge, by way of the swap. The four current `alignItems: 'flex-start'|'flex-end'` uses are all inside row containers, where the cross axis is vertical, so they are genuinely fine. `row(rtl)` alone is called 54 times across 23 files.

### What `isRTL` really resolves from
Not cleanly "the device language", which is how this note first put it. Neither platform computes it that way:

- **iOS** asks for the *app's effective localization*, not the device language. `app.json` declares no Arabic localization, so an Arabic device would likely resolve this app to its base English localization and report LTR — until someone adds `ar` to the bundle localizations, at which point it becomes load-bearing. Expo Go ships its own localizations and can behave differently from a dev build.
- **Android** reads the layout direction of `Locale.getAvailableLocales()[0]` — an arbitrary entry of the JVM's locale array rather than any user preference. That is an upstream bug, and it means the pre-fix direction on Android was effectively nondeterministic rather than "Arabic phone → RTL".

Nondeterminism is a stronger argument for pinning than a known value would have been.

### The fix, and why it is two calls
`index.ts` sets both before `registerRootComponent`:

```
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
```

Both platforms compute `isRTL = isRTLForced || (isRTLAllowed && languageIsRTL)`. `isRTLForced` is an **independent persisted preference** that short-circuits `allowRTL` entirely, so `allowRTL(false)` on its own is a default rather than a pin. It defaults to false, but it is persisted in the *host app's* storage — and in Expo Go that storage is shared across every project loaded in the same install, so another project that ever called `forceRTL(true)` would leave this app resolving RTL regardless. Clearing it is what makes this a pin. `forceRTL(false)` is not "forcing LTR"; it is clearing a flag that would force RTL, so the two are not alternatives.

`swapLeftAndRightInRTL` needs no call: the swap is gated on the direction already being RTL, so it goes inert once the direction is LTR.

### Timing: this does not take effect on the launch it runs in
`allowRTL` and `forceRTL` are not runtime setters. They write persisted preferences — `NSUserDefaults` on iOS, `SharedPreferences` on Android — and whether the current session changes depends on whether the consumer re-reads them.

- **iOS does not re-read.** The root surface captures the layout direction synchronously when it is created, which happens while the bundle is still being evaluated — so by the time `index.ts` executes, the surface already exists. On an RTL device the *first* launch is still RTL and the fix engages from the second. Nothing callable from JavaScript changes that; an earlier call site would not help, and the module graph for `App` is hoisted above these statements anyway.
- **Android does self-correct.** Every root measure pass re-reads the preference, and `SharedPreferences` updates its in-memory map synchronously, so the next measure after mount picks up LTR within the same launch.

An earlier draft of this note had those two platforms the wrong way round and claimed the entry file was "guaranteed to be earlier than the first render". Both were wrong.

### Side effect worth knowing
The write lands in the host app's persistent storage. Under Expo Go that is shared with every other project in the same Expo Go install, so this silently sets `allowRTL=false` for all of them, and it outlives this project. With more than one Expo project on the machine that is observable rather than theoretical. A dev build or a release build has its own storage and no such leak.

### One real cost of being LTR-only
Every mounted view resolves natural text alignment as LTR. Pure Arabic strings are unaffected, because the first strong character still wins, but an Arabic string beginning with a digit or a Latin token gets an LTR base paragraph and its trailing punctuation lands on the wrong side. All three text inputs set `textAlign: align(rtl)` explicitly, so caret and alignment are fine. This is pre-existing rather than introduced here.

### Not verified
No run on a real RTL-language device, which is where the iOS first-launch case would show. This project does not boot emulators.

## Related
- Features: [[In-App RTL and Arabic Typography]], [[Glass Tab Bar]], [[Swipe Row Actions]], [[Ledger Paper Chrome]]
- Page: [[Settings]], [[Main Tabs]], [[Today]], [[Unfiled]], [[Calendar]], [[Onboarding]], [[Swipe States]], [[Project Detail]]
- Bugs: [[Ink Stroke Spans The Whole Title Column]]
