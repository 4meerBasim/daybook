# Quick Add Highlight Drifts From The Caret

Status: fixed
Found: `src/screens/QuickAddSheet.tsx`, the transparent input layered over the syntax-highlight mirror
Summary: Past the width of the quick-add field the caret separated from the coloured text behind it, because the input scrolled horizontally and the mirror did not.

## Details
The sheet draws the parsed, coloured text as a `Text` and lays a transparent `BottomSheetTextInput` over it, so the caret and selection belong to the input while every visible glyph belongs to the mirror. That only holds while the two layers agree on where each glyph is.

The input was `multiline={false}`, so once the text was wider than the field it scrolled horizontally. The mirror sat in `StyleSheet.absoluteFill` with no scroll offset of its own, so from that point on the caret drifted one character further from its glyph for every character typed.

### The fix

Rather than teach the mirror to track two scroll offsets, the layers were swapped so that scrolling cannot happen at all:

- The mirror `Text` is the element in normal flow. It wraps and grows on its own, which is what gives the field its height.
- The input is `multiline`, `scrollEnabled={false}`, and absolutely filled over the mirror. Its height therefore always equals the container's, which always equals its own content height, so neither axis ever has anything to scroll.
- Both layers take the same style object, so font, size, line height, letter spacing, `textAlign` and padding are the same value, not two values that happen to match.

Because the input can no longer scroll and cannot be shorter than its content, caret and highlight are in the same place by construction rather than by keeping two offsets in sync.

### How it was verified

On web, at 420pt wide, with the input's own selection used as the probe: selecting the whole value paints the browser's selection rectangles over the input's invisible glyphs, so the rectangles landing exactly on the visible mirror glyphs is direct evidence the two layers agree. They did, on a two-line entry, a four-line entry, an unbreakable 60-character word broken mid-word, and an Arabic entry right-aligned in RTL. Measured alongside it: identical computed font, size, `line-height`, `letter-spacing`, `white-space` and content width, `scrollLeft` and `scrollTop` both 0, and `scrollWidth`/`scrollHeight` equal to the client box in every case.

Native is unverified — this project does not boot emulators. The one metric that could differ there is Android's `includeFontPadding`, which applies to `Text` and `TextInput` alike and so should cancel out.

Going multiline is also what [[Ledger Paper Chrome]] asks of the rest of the app, so a capture too long for one line now behaves the same in the sheet as it does in the row it becomes.

## Related
- Feature: [[Natural Language Quick Add]], [[Ledger Paper Chrome]]
- Page: [[Quick Add Sheet]]
- Bugs: [[Bottom Sheet Text Input Crashes On Web]] — the other thing wrong with this input on web, still open and unrelated
