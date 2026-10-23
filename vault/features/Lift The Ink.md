# Lift The Ink

Status: shipped
Summary: A slip rises from the page edge after striking, scratching out, snoozing or moving a row, and lifting the ink reverses that exact write.

## Details
`src/components/InkSlip.tsx` plus a `reversal` slice on the store. Four actions now record what they undid before they write:

| Action | Recorded | Lift restores |
|---|---|---|
| strike a row | `struck` | `completedAt` to null |
| scratch out (delete) | `deleted` | `deletedAt` to null |
| snooze | `snoozed` + prior `snoozedUntil` | the prior value |
| move to tomorrow from [[Unfiled]] | `rescheduled` + prior `dueDate` | the prior value |

The prior value is read out of the snapshot the action came from, so a snooze on an already-snoozed row restores the earlier time rather than clearing it. Nothing needed a schema change — completion and delete were already reversible writes, and `restore(id)` finally has a caller.

Striking is only offered when a row goes incomplete to complete; un-ticking a row is already its own reversal and raising a slip for it would be noise.

The slip is one mount, not one per screen: `GlobalSlip` sits inside `NavigationContainer` after the navigator, reads the active route from `useNavigationState`, and takes [[Glass Tab Bar]]'s `useTabBarFootprint()` on `Main` or `useScreenBottom()` on a stack route, so it clears whichever bottom chrome that screen actually has. It is suppressed on [[Onboarding]], [[Focus Mode]] and [[Page Closed]], which have no reversible rows. It is `metrics.minTap` tall and the Lift target is too.

It lingers five seconds, then clears itself by sequence number — `clearReversal(seq)` only clears if the slip is still the one its timer was started for, so a second action replacing a first does not get cancelled by the first one's timer. A new action replaces the slip rather than queuing behind it; the slip always describes the most recent write.

The reversal reads as a lift rather than a fade because [[Ink Strike-Through Completion]] already animates the stroke's width back to zero over 240ms when `completedAt` clears — the stroke retracts off the text. Under [[Reduced Motion Mode]] the slip appears without the rise and the stroke just disappears.

What is deliberately not here: a permanent route back to scratched-out rows. A soft delete is invisible once the slip is gone, which is a trash screen and a different concern. Reversing a carry belongs to [[Closing the Page Ritual]] — it moves a row between pages instead of flipping a column, so it is a different shape of reversal.

## Related
- Page: [[Today]], [[Upcoming]], [[Unfiled]], [[Project Detail]], [[Calendar]], [[Swipe States]]
- Features: [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Offline First Local Store]], [[Reduced Motion Mode]], [[Glass Tab Bar]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Closing the Page Ritual]]
