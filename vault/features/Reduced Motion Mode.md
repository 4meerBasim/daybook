# Reduced Motion Mode

Status: shipped
Summary: A single settings toggle turns every animation in the app into an instant state change, without removing the state change itself.

## Details
`motion` lives on the theme context (`src/theme/ThemeProvider.tsx`) as `full` | `reduced`, with `reduced` exposed as a boolean. It is honoured everywhere motion exists, and in every case the animated value is *assigned* rather than removed, so the end state is identical:

| Where | Reduced behaviour |
|---|---|
| `TaskRow.tsx` | stroke width and dry colour jump to target — see [[Ink Strike-Through Completion]] |
| `SwipeableRow.tsx` | the row settles to zero instantly — see [[Swipe Row Actions]] |
| `Stamp.tsx` | opacity 0.9 and scale 1 with no overshoot — see [[Wax Page Closed Stamp]] |
| `Toggle.tsx` | the knob snaps |
| `PageHeader.tsx` | the scroll-linked style returns `{}`, so the title stays at 40pt — see [[Collapsing Page Header]] |
| `FocusScreen.tsx` | the minute strips fill without the 600ms colour interpolation — see [[Focus Timer]] |
| `QuickAddSheet.tsx` | `animateOnMount` and `autoFocus` are both disabled, so the sheet and keyboard appear without a transition |

Controlled from the Reduce motion row on [[Settings]].

## Related
- Page: [[Settings]], [[Today]], [[Focus Mode]], [[Quick Add Sheet]], [[Swipe States]], [[Page Closed]]
- Features: [[Ink Strike-Through Completion]], [[Swipe Row Actions]], [[Wax Page Closed Stamp]], [[Collapsing Page Header]], [[Focus Timer]]
- Bugs: none
