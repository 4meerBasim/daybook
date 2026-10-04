# Home-screen widget

Status: shipped
Summary: An Android home-screen widget that shows today's tasks — each title with its done state and a done/total count — mirroring [[Today]], and refreshing when today's tasks change.

## Details
Android only, built on `react-native-android-widget` (v0.22.1). iOS is a documented limitation (see below).

Config: the widget is declared in `app.json` under `plugins` as `["react-native-android-widget", { widgets: [{ name: "Today", label, description, minWidth "180dp", minHeight "110dp", targetCellWidth 3, targetCellHeight 2, resizeMode "horizontal|vertical", updatePeriodMillis 1800000 }] }]`. The plugin needs an Android package name, so `android.package` was set to `com.daybook.app` (new). `app.config.js` spreads `app.json`, so the plugin is edited in `app.json`.

Code lives under `src/widget/`:
- `widget-data.ts` — a standalone `expo-sqlite` reader (`loadWidgetState`) that opens `daybook.db` directly and selects today's tasks the same way the store defines them: `list = 'today'`, not `later`, `deletedAt IS NULL`, not cleared, left-joined to `task_state` for `done`, ordered by rowid, capped at 7. It also reads the `lang` setting so `widgetLabels(lang)` returns localized title / empty / progress strings (EN + MSA Arabic). The handler runs headless and CANNOT touch the React store, so it reuses the real schema/column names from [[Persistence layer]] instead.
- `TodayWidget.tsx` — the widget UI from the library's `FlexWidget` / `TextWidget` primitives: a header row (title + done/total), a per-task checkbox glyph + truncated title, and an empty state. Paper/ink colours are inlined (the widget has no theme context).
- `widget-task-handler.tsx` — `widgetTaskHandler`, registered via `registerWidgetTaskHandler` in `index.ts`. Handles `WIDGET_ADDED` / `WIDGET_UPDATE` / `WIDGET_RESIZED` / `WIDGET_CLICK`, ignores `WIDGET_DELETED`.
- `refresh.tsx` — `refreshTodayWidget()` calls `requestWidgetUpdate({ widgetName: 'Today', ... })`. It early-returns off Android and is wrapped in try/catch, so it is a safe no-op in Expo Go / iOS / web / when no widget is pinned. The store calls it (fire-and-forget) from every action that changes today's tasks: `toggle`, `addTask`, `clear`, `deleteTask`, `setDue`, and after `hydrate`.

Build requirement: the widget needs a dev/EAS build — it does NOT appear in Expo Go. iOS is not supported; a real iOS widget needs a native WidgetKit target, which is out of scope for a managed build.

Native projects — Continuous Native Generation (CNG): the `android/` and `ios/` folders are NOT committed; they are git-ignored (`.gitignore` → "generated native folders") and regenerated with `npx expo prebuild`. `app.json` + `app.config.js` (plus the config plugins and `EXPO_PUBLIC_*` env) are the single source of truth, so native config is edited there, never in the generated folders. `npx expo prebuild --no-install` succeeds for Android on Windows (CocoaPods is unavailable there, so iOS pods must be installed on a macOS machine; `ios.bundleIdentifier` / `android.package` are both `com.daybook.app`). prebuild also rewrites the `android`/`ios` npm scripts to `expo run:*` (dev-build launch). One benign prebuild warning remains: `android: userInterfaceStyle: Install expo-system-ui in your project to enable this feature.` — the app already drives light/dark itself via the theme + `useColorScheme`, so it is informational; add `expo-system-ui` to silence it and honour the native `userInterfaceStyle` if desired.

## Related
- Page: [[Today]], [[Settings]]
- Features: [[Persistence layer]], [[Account sign-in (Google and Apple)]]
- Enhancements: [[iOS home-screen widget]]
- Bugs: [[Expo Go crashes on launch from native-only modules]]
