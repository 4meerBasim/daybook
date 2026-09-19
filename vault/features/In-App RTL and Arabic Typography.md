# In-App RTL and Arabic Typography

Status: shipped
Summary: Switching to Arabic mirrors every layout and swaps to Arabic typefaces immediately, without restarting the app.

## Details
Direction is a derived value, not `I18nManager.forceRTL`, so the flip happens live. `src/theme/ThemeProvider.tsx` exposes `ar` and `rtl` from `lang`, and `src/lib/rtl.ts` provides the primitives every screen uses instead of hardcoded sides:

- `row(rtl)` → `row` / `row-reverse`
- `align(rtl)` → `left` / `right`
- `pad(rtl, start, end)`, `marginStart(rtl, v)`, `insetStart(rtl, v)`, `insetEnd(rtl, v)`

This is what moves the red margin rule of [[Ledger Paper Chrome]] to the right edge, flips the tab order in [[Pen FAB Tab Bar]], reverses the swipe direction in [[Swipe Row Actions]], anchors the stroke in [[Ink Strike-Through Completion]], and reverses the calendar grid and its week-start offset on [[Calendar]].

Typography switches per script in `src/theme/fonts.ts`: display Newsreader → Noto Naskh Arabic, UI Instrument Sans → IBM Plex Sans Arabic, and the JetBrains Mono role falls back to IBM Plex Sans Arabic since Naskh has no monospace. The `display`/`ui`/`mono` helpers then compensate for the script — Arabic display sizes scale to 0.9, explicit line heights of 1.35× (display) and 1.53× (UI) replace the Latin defaults, negative letter-spacing is zeroed out, and `chipPadding` widens from 10 to 12.

Digit-bearing elements that must stay in order — the focus countdown and its session counter — are pinned with `writingDirection: 'ltr'`.

The design's mirror list also names the tally bundle stroke, so `StreakTallyIcon` takes a `flip` prop and [[Today]]'s habit row passes `rtl`, mirroring the diagonal that binds the first five marks. The vertical marks of [[Calendar Tally Marks]] need no flip — they are symmetrical.

Because the native layout direction stays LTR, a `Text` resolves its base direction from its first strong character, which gives Arabic strings RTL order for free and keeps Latin runs like `invoice-0918.pdf` intact. The one place that broke was [[Task Detail]]'s attachment caption, where the filename and the Arabic hint shared a single `Text` separated by a newline: the Latin filename won the base direction and dragged the Arabic line LTR with it. They are now two `Text` elements, which is the isolation the design asks for.

Language is set from two places: the English / العربية pair on [[Onboarding]] and the Language row on [[Settings]].

## Related
- Page: [[Onboarding]], [[Settings]], [[Main Tabs]], [[Today]], [[Upcoming]], [[Inbox]], [[Inbox Empty]], [[Search]], [[Quick Add Sheet]], [[Calendar]], [[Project Detail]], [[Task Detail]], [[Focus Mode]], [[Page Closed]], [[Swipe States]]
- Features: [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]], [[Swipe Row Actions]], [[Natural Language Quick Add]]
- Bugs: none
