# Ink Stroke Spans The Whole Title Column

Status: fixed
Found: `src/components/TaskRow.tsx` and `src/screens/ProjectScreen.tsx`, the `onLayout` that captures `textWidth`
Summary: A completed row's stroke ran to the end of the title column instead of stopping at the end of the title; the title and the bar now share a shrink-to-fit box, so the bar's containing block is the text rather than the column.

## Details
Both rows size the stroke from an `onLayout` on the title `Text`. A `Text` is a normal flex child of a column view, and the default `alignItems: 'stretch'` made it as wide as that view — so `onLayout` reported the width of the title column, not the width of the glyphs. "Buy oat milk" measured 315 where its ink is 95, and the stroke was drawn 315 long.

Measured on web while verifying the row-growth work, and not introduced by it: forcing the `-webkit-line-clamp` styling that `numberOfLines={1}` used to produce gave the same 315, so removing `numberOfLines` changed nothing here. It had been wrong since the stroke was written; the design's own screens only drew short strokes because every title in the mock fills its column.

### Why `alignSelf` is not the fix
The obvious one-liner is `alignSelf: 'flex-start'`, and this note originally rejected it because direction is derived rather than set through `I18nManager`, so `flex-start` resolves to the left edge even in Arabic. Making it direction-aware — `rtl ? 'flex-end' : 'flex-start'` — looks like the answer and is worse, because it buries a false premise.

`alignSelf` is **direction-relative**: Yoga resolves a column container's cross axis through the node's resolved layout direction, so under an RTL direction `flex-end` is the physical *left* edge. `insetStart(rtl, -2)` is **physical** — it returns `{ right: -2 }`, and React Native never flips `left`/`right`. The two agree only while the resolved direction is LTR, and nothing in this app pins that. `rtl` here is derived from `lang`, but the native direction comes from `I18nManager.isRTL`, which is `allowRTL && device-preferred-language-is-RTL`. On a phone whose *system* language is Arabic the root view is RTL, and box and bar anchor to opposite edges — an unstruck title beside a floating glyph-width bar, in both app languages. That is worse than the original too-long stroke, which at least crossed the text.

That environment is also already wrong for a larger reason: every `row(rtl)` container in the app double-flips there. See [[Native Layout Direction Is Not Pinned]].

### What was done instead
The title and the bar now sit together in an inner `View` with `flexShrink: 1` and `minWidth: 0`, inside a column that is `flexDirection: row(rtl)`. In a row container a child's main size is content-derived, so that inner box hugs the text with no `alignSelf` anywhere — and because it is the bar's `position: 'relative'` ancestor, the bar is measured and anchored against the text, not the column. Either physical edge now crosses the ink, so the fix holds whichever direction resolves, and the only direction decision left is `row(rtl)`, which is the helper every other mirrored container in the app already uses.

`flexShrink: 1` with `minWidth: 0` keeps a long title wrapping at the column width exactly as before, so [[Ledger Paper Chrome]]'s `useRuling` sees the same heights and the `grown` threshold is unchanged.

The stroke width went from `textWidth + 2` to `textWidth + 4`. With a 2pt lead-in from `insetStart(rtl, -2)`, the old arithmetic left the ink flush with the last glyph once `textWidth` finally meant the glyphs; `+ 4` restores a symmetric 2pt overshoot at both ends, which is what the lead-in was always for.

### Platform note
On react-native-web and Android a `Text` measured with an at-most constraint returns the layout constraint, so a wrapped title's box is the full column width; on iOS the measure returns the glyph bounding rect, i.e. the widest line. The fix is unaffected either way — the box hugs one edge and `textAlign` aligns to that same edge, so the text lands in the same place whichever width comes back. The one visible difference is iOS-only and cosmetic: a wrapped title whose base direction disagrees with `rtl` can have a short final line shift by the wrap slack. Wrapped rows take the decoration path, so no stroke is involved.

Wrapped rows were never affected: [[Ink Strike-Through Completion]] switches to a plain `textDecorationLine` once a row is taller than one rule, and that follows the glyphs exactly. A per-line stroke is not possible here anyway — it would need `onTextLayout`, which react-native-web does not implement.

No other strike in the app measures a width. [[Task Detail]]'s subtasks, [[Search Results]] and [[Page Closed]] all use `textDecorationLine`, which is intrinsically correct, so these two rows were the only sites. [[Swipe States]]'s frozen demo rows draw no strike at all.

## Related
- Feature: [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]]
- Page: [[Today]], [[Project Detail]], [[Unfiled]]
- Bugs: [[Native Layout Direction Is Not Pinned]]
