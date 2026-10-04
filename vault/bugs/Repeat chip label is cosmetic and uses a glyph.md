# Repeat chip label is cosmetic and uses a glyph

Status: fixed
Found: src/lib/parse.ts (repeat chip label)
Fixed: added `describeRecurrence(rule, t, ar)` to src/lib/recurrence.ts and parse.ts now renders the chip from the structured rule in EN + AR (daily/weekly/with-weekdays/monthly/everyN); the ↻ glyph was removed (text-only label).
Summary: The quick-add "repeat" chip shows a cosmetic label that does not reflect the parsed recurrence rule and uses the ↻ glyph.

## Details
`parse.ts` builds the repeat chip label as `'↻ ' + (ar ? 'يتكرر' : 'Repeats ' + token)`, e.g. "↻ Repeats monday", and Arabic collapses to a generic "↻ يتكرر". The structured `RecurrenceRule` is now attached to the chip and used on save, but the visible label does not describe it (frequency / interval / weekdays) and the ↻ symbol brushes against the no-emoji design rule. Pre-existing, but it now interacts with the shipped [[Recurring tasks]] feature. Fix: render the label from the rule via a localized describe helper and replace the glyph with an icon.

## Related
- Feature: [[Recurring tasks]], [[Natural Language Quick Add]]
- Page: [[Quick Add Sheet]]
