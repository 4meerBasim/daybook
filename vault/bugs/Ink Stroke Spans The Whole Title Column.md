# Ink Stroke Spans The Whole Title Column

Status: fixed
Found: `src/components/TaskRow.tsx` and `src/screens/ProjectScreen.tsx`, the `onLayout` that captures `textWidth`
Summary: A completed row's stroke ran to the end of the title column instead of stopping at the end of the title; the title box now hugs its own ink, so `onLayout` reports the glyph width it was always assumed to report.

## Details
Both rows size the stroke from an `onLayout` on the title `Text`. A `Text` is a normal flex child of a column view, and the default `alignItems: 'stretch'` made it as wide as that view — so `onLayout` reported the width of the title column, not the width of the glyphs. "Buy oat milk" measured 315 where its ink is 95, and the stroke was drawn 315 long.

Measured on web while verifying the row-growth work, and not introduced by it: forcing the `-webkit-line-clamp` styling that `numberOfLines={1}` used to produce gave the same 315, so removing `numberOfLines` changed nothing here. It had been wrong since the stroke was written; the design's own screens only drew short strokes because every title in the mock fills its column.

This note previously rejected `alignSelf: 'flex-start'` as the fix, on the grounds that direction is derived rather than set through `I18nManager`, so `flex-start` resolves to the left edge even in Arabic. That objection is right about the bare form and is answered by making the value direction-aware: `alignSelf: rtl ? 'flex-end' : 'flex-start'`. The container's layout direction is LTR in both languages, so `flex-end` puts the box against the physical right edge — which is exactly where `insetStart(rtl, -2)` already anchors the stroke. Box and stroke share one edge in both languages.

The second objection, that it would unhook the title from `textAlign: align(rtl)`, does not hold either. For a single-line title the box equals the text, so `textAlign` has nothing left to do; for a title long enough to wrap, the content needs the full available width, shrink-to-fit returns that width, and `textAlign` applies exactly as before. The two cases never disagree, because a wrapped row is `grown` and takes the decoration path instead of the drawn stroke.

Wrapped rows were never affected: [[Ink Strike-Through Completion]] switches to a plain `textDecorationLine` once a row is taller than one rule, and that follows the glyphs exactly.

No other strike in the app measures a width. [[Task Detail]]'s subtasks, [[Search Results]] and [[Page Closed]] all use `textDecorationLine`, which is intrinsically correct, so these two rows were the only sites.

## Related
- Feature: [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]]
- Page: [[Today]], [[Project Detail]], [[Unfiled]], [[Task Detail]], [[Search Results]], [[Page Closed]]
