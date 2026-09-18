# Focus Mode Unreachable

Status: fixed
Found: `src/navigation/Root.tsx:89`
Summary: The `Focus` route was registered on the stack but nothing in the app ever navigated to it, so focus mode could not be opened.

## Details
`Focus` is declared in `RootParams`, imported, and mounted as a `Stack.Screen` with `presentation: 'fullScreenModal'`. Searching `src/` for `Focus` returns only the screen definition, the import, the type key and the `Stack.Screen` itself — there is no `navigation.navigate('Focus')` anywhere, and no button, row or gesture targets it.

For comparison, every other secondary screen has an entry point: [[Settings]], [[Calendar]] and [[Inbox Empty]] come off tab long-presses, [[Task Detail]] off a row long-press, [[Project Detail]] off a search result, [[Swipe States]] off the Settings shortcuts row, and [[Page Closed]] off the wax stamp.

The screen's own exit works — its check button calls `navigation.goBack()` — so this was purely a missing inbound edge.

Fixed by giving the ellipsis button on [[Task Detail]] an `onFocus` handler that navigates to `Focus`; it previously had no handler at all. The mock describes this affordance as a native context menu (`zeego`) holding Focus, Move and Delete, but `zeego` is not a dependency and adding it would widen the transcription's scope, so the button opens Focus directly and is labelled for that action.

## Related
- Feature: [[Focus Timer]]
- Page: [[Focus Mode]], [[Task Detail]], [[Main Tabs]]
