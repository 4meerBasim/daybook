# Focus Mode

Route: `Focus` (native stack, `presentation: 'fullScreenModal'`)
Summary: A single-task focus session on darker paper — a 64pt monospace countdown over twenty-five strips that ink in one per elapsed minute.

## Related
- Connects to: [[Task Detail]] — the ellipsis button in its header opens this screen, [[Main Tabs]] — the check button calls `navigation.goBack()`, [[Deal]]
- Features: [[Focus Timer]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Deal Me One Task Picker]], [[Focus Live Activity and Widgets]]
- Bugs: [[Focus Mode Unreachable]], [[Stack Screens Ignore The Bottom Safe Area]], [[Task Detail And Focus Show A Mock Task]]
- Enhancements: [[Focus Live Activity and Widgets]]

## Notes
`src/screens/FocusScreen.tsx`. Rendered on `paper2` rather than `paper` so the session reads as a different sheet. The countdown and its run/pause flag are local to this screen, so the interval only runs while the session is on screen. The clock is pinned to `writingDirection: 'ltr'` so digits stay in order in Arabic.

The session runs on the task the caller passed in: the real title, with the project name and first unfinished subtask as a subtitle when they exist. The `1 / 4` counter the mock drew is gone, because nothing counts sessions. See [[Task Detail And Focus Show A Mock Task]].
