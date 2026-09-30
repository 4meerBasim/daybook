# Quick Add Sheet Shown On Launch

Status: fixed
Found: reported by user
Summary: The quick-add sheet was visible as soon as the app opened, before the pen FAB had been pressed.

## Details
`QuickAddSheet` was always mounted inside `MainTabs` and relied on `index={-1}` plus an effect calling `close()` / `expand()` from an `open` prop to stay hidden. On launch the sheet still appeared.

Fixed by not mounting it until it is wanted: `src/navigation/Root.tsx` renders `<QuickAddSheet />` only while `adding` is true, and the sheet itself now starts at `index={0}` with `autoFocus` on its input (off under reduced motion). Add and the keyboard's submit key call `sheetRef.current?.forceClose()` — a forced close is not cancelled by the keyboard hiding mid-animation, and the input uses `submitBehavior="submit"` so the submit key does not drop the keyboard early — so the sheet animates shut and its `onClose` clears `adding`, which unmounts it; pan-down and backdrop tap take the same path. The `open` prop is gone, and the selected project resets for free because the component remounts each time.

Not verified on a device — the cause inside `@gorhom/bottom-sheet` was not isolated, only removed from the launch path.

## Related
- Feature: [[Natural Language Quick Add]], [[Pen FAB Tab Bar]]
- Page: [[Quick Add Sheet]], [[Main Tabs]]
