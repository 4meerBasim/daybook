# Wax Page Closed Stamp

Status: shipped
Summary: When the last task on the day is struck through, a tilted vermilion "page closed" stamp presses onto the sheet.

## Details
`src/components/Stamp.tsx`. A 3pt vermilion border box holding uppercase tracked monospace, rotated `-7deg` so it never sits square to the ruled lines. The press is a single `progress` shared value over `duration.page` (320ms) hand-shaped into an overshoot: it scales 1.18 → 0.97 across the first 60% then eases 0.97 → 1.00, while opacity ramps to 0.9 over the same first 60% — the ink lands before the box finishes settling. Under [[Reduced Motion Mode]] it renders at scale 1 / opacity 0.9 with no animation.

Two sizes ship. [[Today]] renders the small variant, revealed only when `leftN === 0`, wrapped in a `Pressable` that navigates to [[Page Closed]]. [[Page Closed]] renders it at size 26 with a timestamp caption underneath, laid over the struck-through lines as a non-interactive overlay.

The 0.9 opacity ceiling is deliberate — the stamp reads as ink absorbed into paper rather than a solid UI element.

## Related
- Page: [[Today]], [[Page Closed]]
- Features: [[Ink Strike-Through Completion]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]]
- Bugs: none
