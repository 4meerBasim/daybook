# Bottom Sheet Text Input Crashes On Web

Status: not-fixed
Found: `node_modules/@gorhom/bottom-sheet/lib/commonjs/components/bottomSheetTextInput/BottomSheetTextInput.js:42`, surfaced by the `BottomSheetTextInput` in `src/screens/QuickAddSheet.tsx`
Summary: On web, blurring the quick-add input throws `TypeError: RNTextInput.default.State.currentlyFocusedInput is not a function`, because `@gorhom/bottom-sheet` calls an API that `react-native-web` does not expose.

## Details
`BottomSheetTextInput`'s blur handler does this:

```
const currentFocusedInput = findNodeHandle(TextInput.State.currentlyFocusedInput());
```

React Native exposes `TextInput.State.currentlyFocusedInput()`. `react-native-web` exposes `TextInputState.currentlyFocusedField()` instead and has no `currentlyFocusedInput`, so the call throws every time the input loses focus — which on [[Quick Add Sheet]] means every time the sheet closes.

Library-versus-shim, entirely outside this codebase: `@gorhom/bottom-sheet` 5.2.14 against `react-native-web` 0.21.2. Web only; native has the API the library expects.

Not a functional blocker in practice. The error is thrown inside a blur callback, React logs it and the flow continues — composing, submitting and closing the sheet all work, and the task is still inserted. It shows up as a red error overlay entry in the web dev client, which is noisy enough to be worth recording.

Found while verifying [[Offline First Local Store]] on web, not introduced by it. The offending `BottomSheetTextInput` and its `inputRef.current?.focus()` effect predate that work; only the line number moved.

Options, none taken yet:

- Patch the shim by assigning `currentlyFocusedInput` onto `TextInput.State` on web before the sheet mounts. Cheap, but it is a monkey-patch on a third-party surface.
- Use a plain `TextInput` on web and `BottomSheetTextInput` on native, losing the sheet's keyboard-avoidance on web where it matters least.
- Wait for the library. Worth checking whether a newer `@gorhom/bottom-sheet` handles the web shim before spending anything here.

Native behaviour is unverified — this project does not boot emulators, so the claim that native is unaffected rests on `react-native`'s own API surface rather than a run.

## Related
- Feature: [[Natural Language Quick Add]], [[Pen FAB Tab Bar]]
- Page: [[Quick Add Sheet]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Highlight Drifts From The Caret]]
