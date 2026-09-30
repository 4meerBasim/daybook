# Pen FAB Tab Bar

Status: shipped
Summary: A four-tab bar with a raised round pen button in the middle for capture, where long-pressing a tab opens that section's secondary screen.

## Details
`src/components/TabBar.tsx`. The bar is absolutely pinned at 84pt on `paper2` with a top hairline, and the tabs are split around the pen — Today and Recent before it, Inbox and Profile after — so the button sits in the centre. The pen itself is a 56pt fully rounded `Pressable` filled with `c.ink`, lifted `marginTop: -30` above the bar with `penShadow` from the tokens, and it fires a medium haptic before opening [[Quick Add Sheet]].

Each `TabItem` is a 56×56 target carrying `accessibilityRole="tab"` and a localised label, with the active tab in `c.ink` and the rest in `c.ink3`; Recent uses the clock icon, and the Today icon swaps to a variant that takes `paper2` as its fill when active so the page icon reads against the bar.

The `onLongPress` callback is the shortcut layer, wired in `src/navigation/Root.tsx`:

- long-press Today → [[Settings]]
- long-press Inbox → [[Inbox Empty]]

Inbox Empty has no other entry point; Settings is also reachable from the Settings row on [[Profile]]. The Recent tab has no long-press shortcut: Calendar is no longer reached from the bar, only from the pick-date swipe on a task row.

The whole bar mirrors with `row(rtl)`, so in Arabic Profile sits leftmost and the tab order reverses around the pen.

## Related
- Page: [[Main Tabs]], [[Today]], [[Recent]], [[Inbox]], [[Profile]], [[Quick Add Sheet]], [[Settings]], [[Inbox Empty]]
- Features: [[Natural Language Quick Add]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none
