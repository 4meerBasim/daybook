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

## Related
- Page: [[Today]], [[Settings]]
- Features: [[Persistence layer]]
