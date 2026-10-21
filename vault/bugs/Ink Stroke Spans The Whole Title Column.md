# Ink Stroke Spans The Whole Title Column

Status: not-fixed
Found: `src/components/TaskRow.tsx` and `src/screens/ProjectScreen.tsx`, the `onLayout` that captures `textWidth`
Summary: A completed row's stroke runs to the end of the title column instead of stopping at the end of the title, so short titles are struck by a line trailing far past their last letter.

## Details
Both screens size the stroke from an `onLayout` on the title `Text`. A `Text` is a normal flex child of a column view, and the default `alignItems: 'stretch'` makes it as wide as that view — so `onLayout` reports the width of the title column, not the width of the glyphs. "Buy oat milk" measures 315 where its ink is 95, and the stroke is drawn 315 long.

Measured on web while verifying the row-growth work, and not introduced by it: forcing the `-webkit-line-clamp` styling that `numberOfLines={1}` used to produce gives the same 315, so removing `numberOfLines` changed nothing here. It has been wrong since the stroke was written; the design's own screens only draw short strokes because every title in the mock fills its column.

The obvious fix, `alignSelf: 'flex-start'`, is wrong for this app: direction is derived rather than set through `I18nManager`, so `flex-start` resolves to the left edge even in Arabic and would unhook the title from `textAlign: align(rtl)`. A real fix needs the glyph width measured some other way, or the stroke drawn as a text decoration whose growth is animated — neither of which is a small change.

Wrapped rows are unaffected: [[Ink Strike-Through Completion]] switches to a plain `textDecorationLine` once a row is taller than one rule, and that follows the glyphs exactly.

## Related
- Feature: [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]]
- Page: [[Today]], [[Project Detail]]
