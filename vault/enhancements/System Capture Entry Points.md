# System Capture Entry Points

Status: planned
Summary: Capture from outside the app — the iOS share sheet, Android send intents, and a voice assistant shortcut — so a thought never needs the app opened first.

## Notes
The Add item in the bar is the fastest capture inside the app, which is the wrong measure: most thoughts arrive while the user is somewhere else. A share-sheet target, an Android `ACTION_SEND` handler and an assistant shortcut mean the app is never the obstacle.

Anything shared in would land as an undated capture, which is where this now runs into a wall: the Inbox screen that undated captures used to land on was deleted in the tab-bar redesign, and no screen lists them any more — [[Undated Unassigned Tasks Have No Screen]]. External capture into an invisible pile is worse than no external capture, so that has to be resolved first, and the triage half is blocked on it too — see [[Inbox Triage Chips]].

Open decisions:

- Share extensions are native targets needing a config plugin and a prebuild; the same constraint as [[Focus Live Activity and Widgets]].
- Shared content is usually a URL or a text selection, not a task title. Turning it into something useful reuses `src/lib/parse.ts`, and links probably want to become attachments rather than titles.
- Assistant shortcuts mean App Intents on iOS and App Actions on Android — two specifications for one feature.
- Nothing shared in can be stored while [[Quick Add Does Not Create Tasks]] is open and there is no persistence layer.

## Related
- Page: [[Quick Add Sheet]], [[Main Tabs]]
- Features: [[Natural Language Quick Add]], [[Glass Tab Bar]], [[Pen FAB]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Voice Brain Dump Capture]], [[Inbox Triage Chips]], [[Offline First Local Store]]
