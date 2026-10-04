# iOS home-screen widget

Status: planned
Summary: Bring the Android "Today" home-screen widget to iOS with a native WidgetKit extension that reads today's tasks from shared storage, mirroring [[Home-screen widget]].

## Notes
The existing [[Home-screen widget]] is Android-only (`react-native-android-widget`). iOS home-screen widgets require a native **WidgetKit** app-extension target written in Swift/SwiftUI — JS cannot render a home-screen widget on iOS, so this can't be done in the managed runtime and needs a config plugin that adds the target at prebuild (we are on CNG — `ios/` is generated, so the target must be declared in config, never hand-edited; see the CNG note on [[Home-screen widget]]).

Recommended approach:
- **Target generation:** use `@bacons/apple-targets` (a config plugin that declares Apple extension targets — incl. WidgetKit — in `app.config.js` and materialises the Xcode target on `npx expo prebuild`). A hand-rolled custom config plugin that injects the widget extension + entitlements is the fallback if `@bacons/apple-targets` is unsuitable.
- **Shared data via App Group:** add an App Group (e.g. `group.com.daybook.app`) to both the app and the widget extension. The app writes a small today-tasks snapshot into the group container whenever today's tasks change — reuse the existing `refreshTodayWidget()` call sites in `src/state/store.tsx` (`toggle`/`addTask`/`clear`/`deleteTask`/`setDue`/after `hydrate`) and have the native side read it. Prefer writing a compact JSON payload (title, done, done/total count) that mirrors `loadWidgetState` in `src/widget/widget-data.ts` to `UserDefaults(suiteName:)` or a shared file, over exposing the raw `daybook.db` to Swift (which would couple the Swift target to the SQLite schema). After each write, call `WidgetCenter.shared.reloadTimelines(...)`.
- **Widget UI (SwiftUI):** mirror the Android layout from [[Home-screen widget]] / [[Today]] — a header (title + done/total), up to ~7 task rows (checkbox glyph + truncated title), and an empty state; inline paper/ink colours; localized EN + MSA Arabic with RTL. Tapping opens the app (widget deep-link URL).
- **Requirements:** Apple Developer account, App Group capability, a dev/EAS build (not Expo Go). The TimelineProvider refreshes on a cadence plus on the explicit `reloadTimelines` nudge.

Scope note: planning only — no implementation in this pass.

## Related
- Page: [[Today]]
- Features: [[Home-screen widget]], [[Persistence layer]]
