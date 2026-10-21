# Focus Live Activity and Widgets

Status: planned
Summary: Put the focus countdown on the lock screen and Dynamic Island, the day's page on the home screen, and a progress notification on Android.

## Notes
Perceived-quality work. A timer living in the Dynamic Island and a home-screen widget showing today's ruled page are what make an app read as native rather than as a React Native shell — and this aesthetic renders beautifully small.

[[Focus Timer]] is the obvious candidate: twenty-five strips inking in one per elapsed minute is already a legible progress metaphor at any size.

Open decisions:

- Live Activities and widgets are native targets — WidgetKit on iOS, Glance on Android. That means a config plugin and a prebuild; it cannot run in Expo Go, and per this project's practice it is not verified on an emulator either.
- Android's equivalent of a Live Activity is an ongoing notification with a progress bar — a different surface with different constraints.
- Widget data needs a store the native side can read (App Group / shared preferences), which is a real constraint on [[Offline First Local Store]].
- The timer has no in-app entry point yet ([[Focus Mode Unreachable]]), which should be fixed before the out-of-app surfaces are built.

## Related
- Page: [[Focus Mode]], [[Today]]
- Features: [[Focus Timer]], [[Ledger Paper Chrome]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: [[Offline First Local Store]], [[Deal Me One Task Picker]]
