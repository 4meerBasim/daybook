# Focus Live Activity and Widgets

Status: shipped
Summary: A focus session is state, not screen state — it survives backgrounding and a restart, and it shows as an ongoing notification while it runs.

## Details
The original scope was a Live Activity, a home-screen widget and an Android progress notification. Two of those three are native targets this project cannot build; what shipped is the part that is both achievable and the prerequisite for the rest.

**The session left the screen.** `FocusScreen` held `left` and `running` in `useState` with a `setInterval` decrementing a counter, so the session existed only while the screen was mounted: backgrounding the app, or navigating away, silently lost it. No out-of-app surface can exist on top of that.

The session is now `{ taskId, startedAt, pausedAt }` on the store, persisted as JSON in `prefs`. The remaining time is **computed from the wall clock**, not accumulated by a timer, so backgrounding for ten minutes costs ten minutes of the session exactly as it should, and force-quitting and reopening resumes it. Pausing stamps `pausedAt`; resuming pushes `startedAt` forward by the time spent paused, which keeps one field authoritative rather than tracking accumulated-elapsed separately.

The ticking interval now only drives the on-screen clock, so it is a render concern rather than the source of truth.

**The out-of-app surface.** `SessionNotice` presents an ongoing (`sticky`) notification carrying the task title and "18:42 left on the page", re-presented under a fixed identifier every thirty seconds while the session runs, showing the pause state when paused, and dismissed when the session ends or the time runs out. It requires the notifications permission from [[Adaptive Reminders]], so it inherits that toggle rather than asking separately.

**No progress bar, which is a feature not a shortfall.** `expo-notifications` exposes `sticky` and `color` but no Android progress field — and this project's design rules reject progress bars anyway, the same decision [[Day Capacity Budget]] took when it chose overrunning ruled lines over a filled bar. A monospace countdown is both the expressible option and the on-brand one.

**Starting a session** is explicit now: [[Deal]] starts one when it hands a card to Focus, and [[Focus Mode]] starts one for its task if none is running. Finishing dismisses the session and the notification together.

## Not done: the native targets
- **iOS Live Activity / Dynamic Island.** ActivityKit requires a widget-extension target in an Xcode project, a Swift `ActivityAttributes` type, and the `NSSupportsLiveActivities` key. None of that can be expressed in `app.json`, and this project has no `ios/` directory.
- **Home-screen widgets.** WidgetKit on iOS and Glance on Android are likewise native targets, and their data path is the real constraint the note identified: a widget reads a shared container (an App Group on iOS, shared preferences on Android), which [[Offline First Local Store]] does not write to — the SQLite database lives in the app's own sandbox. Giving the widget data means either mirroring a snapshot into a shared container on every write, or moving the database into the App Group, and that is a decision about the store rather than about the widget.

Writing Swift and Kotlin for targets that cannot be compiled or run here would leave unverifiable code in the tree, which this project's rules rule out. The session state those surfaces would render is now durable and addressable, so the remaining work is the native target and the shared container, not the model.

## Related
- Page: [[Focus Mode]], [[Today]], [[Deal]]
- Features: [[Focus Timer]], [[Ledger Paper Chrome]], [[Adaptive Reminders]], [[Deal Me One Task Picker]], [[Day Capacity Budget]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: [[Offline First Local Store]]
