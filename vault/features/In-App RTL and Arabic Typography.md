# In-App RTL and Arabic Typography

Status: shipped
Summary: Switching to Arabic mirrors every layout and swaps to Arabic typefaces immediately, without restarting the app.

## Details
Direction is a derived value, not `I18nManager.forceRTL`, so the flip happens live. `lang` persists to the `prefs` table, so an Arabic reader no longer re-picks their language on every launch — see [[Theme Preferences Reset On Every Launch]]. `src/theme/ThemeProvider.tsx` exposes `ar` and `rtl` from `lang`, and `src/lib/rtl.ts` provides the primitives every screen uses instead of hardcoded sides:

- `row(rtl)` → `row` / `row-reverse`
- `align(rtl)` → `left` / `right`
- `pad(rtl, start, end)`, `marginStart(rtl, v)`, `insetStart(rtl, v)`, `insetEnd(rtl, v)`

This is what moves the red margin rule of [[Ledger Paper Chrome]] to the right edge, flips the tab order in [[Glass Tab Bar]], reverses the swipe direction in [[Swipe Row Actions]], anchors the stroke in [[Ink Strike-Through Completion]], and reverses the calendar grid and its week-start offset on [[Calendar]].

The redesign's three animations all mirror off the same helpers rather than needing their own RTL branches. The tab bar's sliding indicator computes its resting slot as `(rtl ? last - index : index) * slot`, so it travels right-to-left in Arabic. The pane carousel of [[Animated Page Transitions]] lays its strip out with `row(rtl)` and inverts the same index, so Today sits rightmost and the slide direction reverses with it. The search capsule of [[Expanding Search Field]] is pinned with `insetEnd(rtl, 0)` and grows toward the leading edge, so it expands the other way with no extra code, and its field row is a `row(rtl)` with `align(rtl)` on the input.

Typography switches per script in `src/theme/fonts.ts`: display Newsreader → Noto Naskh Arabic, UI Instrument Sans → IBM Plex Sans Arabic, and the JetBrains Mono role falls back to IBM Plex Sans Arabic since Naskh has no monospace. The `display`/`ui`/`mono` helpers then compensate for the script — Arabic display sizes scale to 0.9, explicit line heights of 1.35× (display) and 1.53× (UI) replace the Latin defaults, negative letter-spacing is zeroed out, and `chipPadding` widens from 10 to 12.

Digit-bearing elements that must stay in order — the focus countdown and its session counter — are pinned with `writingDirection: 'ltr'`.

`chipPadding` reaches every chip now that the four screens that drew their own pill inline use the shared `Chip` in `src/components/Chip.tsx`; the filter chips on [[Search Results]] are the one remaining bespoke pill, because they carry a selected state, and they widen by the same 2pt.

Dates are localised the same way the rest of the copy is: `weekdays`, `months` and `dateComma` in `src/i18n/strings.ts`, assembled by `longDate()`. The weekday array is ordered the way `wd` already was — Monday first in English, Saturday first in Arabic — with `firstWeekday` mapping `Date.getDay()` onto it. Arabic takes real Arabic month names, an Arabic comma, and Naskh regular in place of the Latin italic, since the design notes that Arabic has no italics and the hierarchy has to come from size alone. Numerals stay Western by default, with Eastern Arabic numerals left as the setting the design describes and nothing implements yet.

The design's mirror list also names the tally bundle stroke, so `StreakTallyIcon` takes a `flip` prop and [[Today]]'s habit row passes `rtl`, mirroring the diagonal that binds the first five marks. The vertical marks of [[Calendar Tally Marks]] need no flip — they are symmetrical.

Because the native layout direction stays LTR, a `Text` resolves its base direction from its first strong character, which gives Arabic strings RTL order for free and keeps Latin runs like `invoice-0918.pdf` intact. The one place that broke was [[Task Detail]]'s attachment caption, where the filename and the Arabic hint shared a single `Text` separated by a newline: the Latin filename won the base direction and dragged the Arabic line LTR with it. They are now two `Text` elements, which is the isolation the design asks for.

Language is set from two places: the English / العربية pair on [[Onboarding]] and the Language row on [[Settings]].

## Related
- Page: [[Onboarding]], [[Settings]], [[Profile]], [[Main Tabs]], [[Today]], [[Upcoming]], [[Search Results]], [[Quick Add Sheet]], [[Calendar]], [[Project Detail]], [[Task Detail]], [[Focus Mode]], [[Page Closed]], [[Swipe States]], [[Unfiled]]
- Features: [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]], [[Swipe Row Actions]], [[Natural Language Quick Add]], [[Collapsing Page Header]], [[Glass Tab Bar]], [[Animated Page Transitions]], [[Expanding Search Field]]
- Bugs: [[Page Header Shows A Frozen Date]], [[Ink Stroke Spans The Whole Title Column]], [[Native Layout Direction Is Not Pinned]], [[Theme Preferences Reset On Every Launch]], [[Onboarding Shows On Every Launch]]
- Enhancements: [[Voice Brain Dump Capture]]
