# Native Layout Direction Is Not Pinned

Status: fixed
Found: no `I18nManager` call and no `direction:` style anywhere in `src/`, `App.tsx`, `index.ts` or `app.json`
Summary: [[In-App RTL and Arabic Typography]] mirrors layout in styles and assumes the native layout direction stays LTR, but nothing enforced that — on a device whose *system* language is Arabic, every `flexDirection: row(rtl)` container double-flipped. `index.ts` now calls `I18nManager.allowRTL(false)` before the root component registers.

## Details
The app's mirroring model is style-level: `src/lib/rtl.ts` returns physical values (`left`/`right`, `marginLeft`/`marginRight`) and `row(rtl)` returns `'row-reverse'` for Arabic. `rtl` comes from the in-app `lang` (`ThemeProvider.tsx`), so switching language in [[Settings]] mirrors the UI without a reload. That is deliberate and it is what makes the language toggle instant.

What it assumes is that a plain `'row'` always means left-to-right. That assumption holds only while the resolved native direction is LTR, and the native direction is not ours to assume: `I18nManager.isRTL` is `allowRTL && device-preferred-language-is-RTL`, and `allowRTL` defaults to **true**. Nothing in this project calls `I18nManager.allowRTL(false)`.

So on a phone whose system language is Arabic — not a hypothetical for an Arabic-first app — the root view resolves RTL, a plain `'row'` already lays out right-to-left, and `'row-reverse'` flips it *back* to left-to-right. Arabic UI on an Arabic phone gets Latin-order rows; English UI on that same phone gets Arabic-order rows. Both are wrong, and it is the same single cause.

Exposure is wide rather than deep: `row(rtl)` is called in 20 files. The row-order inversions are the visible symptom — [[Glass Tab Bar]]'s item order and sliding indicator, [[Today]]'s and [[Unfiled]]'s row content, [[Swipe Row Actions]]' action panes, [[Main Tabs]]' pane strip, `Segmented`, `SettingsRows`, [[Calendar]]'s weekday row and grid.

The rest of `rtl.ts` is unaffected, because physical properties do not flip: `insetStart`, `insetEnd`, `pad`, `marginStart` and `borderStart` all resolve the same either way, and `align(rtl)`'s `textAlign: 'right'` is physical too. Anything **direction-relative** is exposed — `flexDirection` today, and `alignSelf`/`alignItems` on the cross axis of a column if they are ever used for horizontal placement. The four current `alignItems: 'flex-start'|'flex-end'` uses are all in row containers, where that property is the vertical axis, so they are fine.

Found while fixing [[Ink Stroke Spans The Whole Title Column]], where a proposed `alignSelf: rtl ? 'flex-end' : 'flex-start'` would have been the first direction-relative horizontal placement in the codebase and would have failed in exactly this environment. That fix was restructured to avoid the premise rather than depend on it, so this bug is latent today, not active — but the next direction-relative style added anywhere will trip over it.

### The fix
`index.ts` calls `I18nManager.allowRTL(false)` at module scope, before `registerRootComponent`. `isRTL` is `allowRTL && device-preferred-language-is-RTL`, so denying the first term pins the resolved direction to LTR on every device and makes true what [[In-App RTL and Arabic Typography]] already documented as true. It sits in `index.ts` rather than `App.tsx` because it has to run before any view exists, and the entry file is the only place guaranteed to be earlier than the first render.

`allowRTL(false)` rather than `forceRTL(false)`: the former is the declaration that this app is LTR-only, which is exactly the claim the style-level mirroring makes. Forcing would be the same outcome by a blunter route.

Nothing else in the app touches `I18nManager`, so this is the single point of control.

### What is not verified
`allowRTL` is documented as needing to be called before rendering, and on Android the native side can cache a direction it already resolved, so the very first launch after installing onto an already-RTL device is the one case that wants checking on real hardware. This project does not boot emulators, so that check has not happened. Every launch after sets it before any view is created.

Worth knowing: because the exposure was latent rather than active — no direction-relative horizontal style had shipped, which is why [[Ink Stroke Spans The Whole Title Column]] was restructured to avoid depending on this — nothing visibly changes on an LTR device. The fix is insurance against the next such style, and a real fix on an Arabic-system phone.

## Related
- Features: [[In-App RTL and Arabic Typography]], [[Glass Tab Bar]], [[Swipe Row Actions]], [[Ledger Paper Chrome]]
- Page: [[Settings]], [[Main Tabs]], [[Today]], [[Unfiled]], [[Calendar]], [[Onboarding]]
- Bugs: [[Ink Stroke Spans The Whole Title Column]]
