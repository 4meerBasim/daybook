# Focus Mode

Route: `Focus` (native stack, `presentation: 'fullScreenModal'`)
Summary: A single-task focus session on darker paper — a 64pt monospace countdown over twenty-five strips that ink in one per elapsed minute.

## Related
- Connects to: [[Task Detail]] — the ellipsis button in its header opens this screen, [[Main Tabs]] — the check button calls `navigation.goBack()`
- Features: [[Focus Timer]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: none

## Notes
`src/screens/FocusScreen.tsx`. Rendered on `paper2` rather than `paper` so the session reads as a different sheet. The countdown and its run/pause flag are local to this screen, so the interval only runs while the session is on screen. The clock and the "1 / 4" session counter are pinned to `writingDirection: 'ltr'` so digits stay in order in Arabic.
