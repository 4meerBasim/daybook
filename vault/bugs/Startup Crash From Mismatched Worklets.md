# Startup Crash From Mismatched Worklets

Status: not-fixed
Found: `package.json` dependency tree
Summary: The app red-screened immediately on launch in an Android dev build because `react-native-worklets` resolved to 0.10.4 while Expo SDK 57 ships and expects 0.10.1.

## Details
`react-native-worklets` was never declared in `package.json`. It arrived only as a transitive dependency, and the lockfile had hoisted **0.10.4** to the root of `node_modules`. Two packages consume it: `react-native-reanimated@4.5.1` (peer range `0.10.x`) and `expo-modules-core@57.0.19`. `expo/bundledNativeModules.json` pins the SDK 57 version to **0.10.1**, so every consumer was running against a worklets build the SDK does not ship.

The JS bundle compiles cleanly for Android (1568 modules) and `tsc --noEmit` passes, so nothing is wrong in app code. Running the same entry point on web boots without a console error, which rules out a module-init throw in [[Ledger Paper Chrome]] or the theme and store providers — the failure is native-side only.

`npx expo-doctor` flagged the same thing: *"Missing peer dependency: react-native-worklets ... Your app may crash outside of Expo Go without this dependency. Native module peer dependencies must be installed directly."*

Fixed by declaring `react-native-worklets` directly at the SDK-pinned 0.10.1 so it cannot drift again, and bumping `expo` to the matching `~57.0.25` patch. The dev build has to be rebuilt after this — the old binary still has native worklets 0.10.4 compiled into it, and a JS/native version split red-screens the same way.

This is the same class of failure as the shared Metro cache picking up another project's worklets copy; `expo start -c` clears that, but a wrong version in `node_modules` needs the dependency pinned.

## Related
- Feature: [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Collapsing Page Header]], [[Reduced Motion Mode]]
- Page: [[Main Tabs]], [[Today]]
