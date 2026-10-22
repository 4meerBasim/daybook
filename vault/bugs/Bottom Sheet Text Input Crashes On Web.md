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

Library-versus-shim, entirely outside this codebase: `@gorhom/bottom-sheet` 5.2.14 against `react-native-web` `^0.21.2`, resolved 0.21.3.

### Why the shim, and not the other two options
This note previously listed three options. Waiting for the library is out: 5.2.14 is the latest published version, so there is nothing to upgrade to.

A platform split — a plain `TextInput` on web, `BottomSheetTextInput` on native — was rejected. It diverges the component identity across platforms, which means two ref types and two layering behaviours underneath the syntax-highlight mirror that [[Natural Language Quick Add]] draws behind the field. That is a real risk taken on for a bug whose only symptom is a console entry.

So the shim, at module scope in `QuickAddSheet.tsx`, next to the import that needs it:

```
inputState.currentlyFocusedInput ??= () => inputState.currentlyFocusedField?.() ?? null;
```

`??=` means native is untouched — it already has the real method, so nothing is overwritten and there is no `Platform.OS` branch to keep in step. That guard is doing more than it looks: on native the two methods are *not* interchangeable, since `currentlyFocusedField()` returns a numeric handle and `currentlyFocusedInput()` a host instance. They coincide only on web, where both are the DOM node.

On web `TextInput.State` *is* `react-native-web`'s `TextInputState` — `dist/exports/TextInput/index.js:397` assigns it directly. The call is written as a method on `inputState` so the receiver is preserved, which matters: `currentlyFocusedField` reads `this._currentlyFocusedNode`. Destructuring it would throw.

What the shim actually returns on a blur is **null**, not a node, because the web implementation nulls its own state before answering:

```
currentlyFocusedField() {
  if (document.activeElement !== this._currentlyFocusedNode) { this._currentlyFocusedNode = null; }
  return this._currentlyFocusedNode;
}
```

By the time a `blur` handler runs, `activeElement` has already left the input. That is the quiet outcome rather than a problem. The library resolves `findNodeHandle` from its own `utilities/findNodeHandle.web.js`, which calls `react-native-web`'s `findNodeHandle` — and that **unconditionally throws** `findNodeHandle is not supported on web`. The throw is swallowed by a bare `catch {}`, three scroll-ref fallbacks miss on a DOM node, and the function ends at a `console.warn('could not find scrollable ref!')`. Returning null skips all of it: the web helper early-returns on a nullish argument, so the warn is never reached.

The consequence is that the library's focus-retention branch is effectively dead on web, since its guard can never be truthy there. That is immaterial for this app — there is one `BottomSheetTextInput` in the whole codebase — but it is the honest description: the shim stops the throw, it does not make the retention logic work.

It is a monkey-patch on a third-party surface, which is why it carries one of the few comments in the codebase — `foundation/code.md` sanctions a comment for exactly this, a workaround for a specific bug a reader would be surprised by.

### Verification
Both modules were loaded and inspected rather than reasoned about. `TextInput.State` is a plain object literal on native (`react-native/Libraries/Components/TextInput/TextInput.js:965`) with no `Object.freeze` and no getter backing on either platform, so the assignment cannot throw at import — which was the one failure mode worth checking, since it would have stopped the app from starting at all. Native 0.86.3 does define `currentlyFocusedInput`, so `??=` no-ops there. Re-evaluation under Fast Refresh no-ops for the same reason, and there is only one resolvable copy of each module in the tree.

The web app itself was not booted, so the rendered result rests on those readings.

Found while verifying [[Offline First Local Store]] on web, not introduced by it. The offending `BottomSheetTextInput` and its `inputRef.current?.focus()` effect predate that work; only the line number moved.

## Related
- Feature: [[Natural Language Quick Add]], [[Glass Tab Bar]]
- Page: [[Quick Add Sheet]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Highlight Drifts From The Caret]]
