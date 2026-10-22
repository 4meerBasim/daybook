# Bottom Sheet Text Input Crashes On Web

Status: fixed
Found: `node_modules/@gorhom/bottom-sheet/lib/commonjs/components/bottomSheetTextInput/BottomSheetTextInput.js:42`, surfaced by the `BottomSheetTextInput` in `src/screens/QuickAddSheet.tsx`
Summary: On web, blurring the quick-add input threw `TypeError: RNTextInput.default.State.currentlyFocusedInput is not a function`; `src/screens/QuickAddSheet.tsx` now fills that one method in from the equivalent `react-native-web` exposes.

## Details
`BottomSheetTextInput`'s blur handler does this:

```
const currentFocusedInput = findNodeHandle(TextInput.State.currentlyFocusedInput());
```

React Native exposes `TextInput.State.currentlyFocusedInput()`. `react-native-web` exposes `TextInputState.currentlyFocusedField()` instead and has no `currentlyFocusedInput`, so the call threw every time the input lost focus — which on [[Quick Add Sheet]] means every time the sheet closes.

Library-versus-shim, entirely outside this codebase: `@gorhom/bottom-sheet` 5.2.14 against `react-native-web` 0.21.2.

### Why the shim, and not the other two options
This note previously listed three options. Waiting for the library is out: 5.2.14 is the latest published version, so there is nothing to upgrade to.

A platform split — a plain `TextInput` on web, `BottomSheetTextInput` on native — was rejected. It diverges the component identity across platforms, which means two ref types and two layering behaviours underneath the syntax-highlight mirror that [[Natural Language Quick Add]] draws behind the field. That is a real risk taken on for a bug whose only symptom is a console entry.

So the shim, at module scope in `QuickAddSheet.tsx`, next to the import that needs it:

```
inputState.currentlyFocusedInput ??= () => inputState.currentlyFocusedField?.() ?? null;
```

`??=` means native is untouched — it already has the real method, so nothing is overwritten and there is no `Platform.OS` branch to keep in step. On web `TextInput.State` *is* `react-native-web`'s `TextInputState` (it assigns it directly), and `currentlyFocusedField()` returns the focused DOM node or null. The call is written as a method on `inputState` so the receiver is preserved, which matters: `currentlyFocusedField` reads `this._currentlyFocusedNode`. The library then hands that node to `findNodeHandle`, which passes a DOM node straight through on web.

It is a monkey-patch on a third-party surface, which is why it carries one of the few comments in the codebase — `foundation/code.md` sanctions a comment for exactly this, a workaround for a specific bug a reader would be surprised by.

### Verification
The API shapes were read on both sides — `react-native-web`'s `TextInputState` and the library's blur handler — and the assignment's semantics were checked in isolation: web returns the focused node, native keeps its own implementation, and a blurred web state returns null rather than throwing. The web app itself was not booted, so the fix rests on those readings. Native was never affected; it has the API the library expects.

Found while verifying [[Offline First Local Store]] on web, not introduced by it. The offending `BottomSheetTextInput` and its `inputRef.current?.focus()` effect predate that work; only the line number moved.

## Related
- Feature: [[Natural Language Quick Add]], [[Glass Tab Bar]]
- Page: [[Quick Add Sheet]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Highlight Drifts From The Caret]]
