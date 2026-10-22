# Native Layout Direction Is Not Pinned

Status: not-fixed
Found: no `I18nManager` call and no `direction:` style anywhere in `src/`, `App.tsx`, `index.ts` or `app.json`
Summary: [[In-App RTL and Arabic Typography]] mirrors layout in styles and assumes the native layout direction stays LTR, but nothing enforces that — on a device whose *system* language is Arabic, every `flexDirection: row(rtl)` container in the app double-flips.

## Details
The app's mirroring model is style-level: `src/lib/rtl.ts` returns physical values (`left`/`right`, `marginLeft`/`marginRight`) and `row(rtl)` returns `'row-reverse'` for Arabic. `rtl` comes from the in-app `lang` (`ThemeProvider.tsx`), so switching language in [[Settings]] mirrors the UI without a reload. That is deliberate and it is what makes the language toggle instant.

What it assumes is that a plain `'row'` always means left-to-right. That assumption holds only while the resolved native direction is LTR, and the native direction is not ours to assume: `I18nManager.isRTL` is `allowRTL && device-preferred-language-is-RTL`, and `allowRTL` defaults to **true**. Nothing in this project calls `I18nManager.allowRTL(false)`.

So on a phone whose system language is Arabic — not a hypothetical for an Arabic-first app — the root view resolves RTL, a plain `'row'` already lays out right-to-left, and `'row-reverse'` flips it *back* to left-to-right. Arabic UI on an Arabic phone gets Latin-order rows; English UI on that same phone gets Arabic-order rows. Both are wrong, and it is the same single cause.

Exposure is wide rather than deep: `row(rtl)` is called in 20 files. The row-order inversions are the visible symptom — [[Glass Tab Bar]]'s item order and sliding indicator, [[Today]]'s and [[Unfiled]]'s row content, [[Swipe Row Actions]]' action panes, [[Main Tabs]]' pane strip, `Segmented`, `SettingsRows`, [[Calendar]]'s weekday row and grid.

The rest of `rtl.ts` is unaffected, because physical properties do not flip: `insetStart`, `insetEnd`, `pad`, `marginStart` and `borderStart` all resolve the same either way, and `align(rtl)`'s `textAlign: 'right'` is physical too. Anything **direction-relative** is exposed — `flexDirection` today, and `alignSelf`/`alignItems` on the cross axis of a column if they are ever used for horizontal placement. The four current `alignItems: 'flex-start'|'flex-end'` uses are all in row containers, where that property is the vertical axis, so they are fine.

Found while fixing [[Ink Stroke Spans The Whole Title Column]], where a proposed `alignSelf: rtl ? 'flex-end' : 'flex-start'` would have been the first direction-relative horizontal placement in the codebase and would have failed in exactly this environment. That fix was restructured to avoid the premise rather than depend on it, so this bug is latent today, not active — but the next direction-relative style added anywhere will trip over it.

The fix is one line, `I18nManager.allowRTL(false)` before the first render in `App.tsx`, which makes true what [[In-App RTL and Arabic Typography]] already documents as true. It needs checking on a real Arabic-system device rather than reasoned about, which is why it is recorded rather than quietly applied: `allowRTL(false)` is a global that also affects how the OS treats the app, and this project does not verify on emulators.

## Related
- Features: [[In-App RTL and Arabic Typography]], [[Glass Tab Bar]], [[Swipe Row Actions]], [[Ledger Paper Chrome]]
- Page: [[Settings]], [[Main Tabs]], [[Today]], [[Unfiled]], [[Calendar]], [[Onboarding]]
- Bugs: [[Ink Stroke Spans The Whole Title Column]]
