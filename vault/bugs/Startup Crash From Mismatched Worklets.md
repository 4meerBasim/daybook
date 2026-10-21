# Startup Crash From Mismatched Worklets

Status: fixed
Found: `package.json` dependency tree
Summary: The app red-screened immediately on launch in an Android dev build because `react-native-worklets` was never declared as a dependency, so its native module was never autolinked.

## Details
`react-native-reanimated@4.5.1` lists `react-native-worklets` as a **peer** dependency (`0.10.x`), not a dependency — the app has to declare it. It was missing from `package.json`, so npm installed it into `node_modules` as an auto-installed peer, at 0.10.4 rather than the 0.10.1 `expo/bundledNativeModules.json` pins for SDK 57. Because nothing in the app's dependency graph pointed at it, autolinking never pulled its TurboModule into the native build.

The throw chain, all at module-eval time before first paint:

1. `src/theme/tokens.ts:2` — `import { Easing } from 'react-native-reanimated'`, the first reanimated import reachable from `index.ts`.
2. reanimated's `initializers.js` constructs `NativeWorklets` at module scope.
3. `NativeWorklets.native.js` throws `[Worklets] Native part of Worklets doesn't seem to be initialized` because `globalThis.__workletsModuleProxy` is undefined.

Nothing was wrong in app code: the Android bundle compiles (1568 modules), `tsc --noEmit` passes, and the same entry point boots on web with no console error — web takes reanimated's `SHOULD_BE_USE_WEB` branch and skips worklets init, which is exactly the split a missing native module produces.

`npx expo-doctor` flagged it directly: *"Missing peer dependency: react-native-worklets ... Your app may crash outside of Expo Go without this dependency. Native module peer dependencies must be installed directly."*

Fixed by declaring `react-native-worklets` at 0.10.1 and bumping `expo` to the matching `~57.0.25`. A JS reload or `expo start -c` does not help — the native app has to be rebuilt so the TurboModule is linked.

`src/theme/tokens.ts:33` calls `Easing.bezier(...)` at module scope, which is what made the failure land on the very first module evaluation rather than at first animation. That is the messenger, not the cause, and it is left as is.

## Related
- Feature: [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Collapsing Page Header]], [[Reduced Motion Mode]], [[Animated Page Transitions]], [[Glass Tab Bar]], [[Expanding Search Field]] — the three worklet-driven animations added since
- Page: [[Main Tabs]], [[Today]]
