# System Capture Entry Points

Status: shipped
Summary: Text shared from another app, or handed over by a link, becomes a capture without the app being opened first.

## Details
The Add item in the bar is the fastest capture *inside* the app, which is the wrong measure — most thoughts arrive while the user is somewhere else.

**Android share sheet.** `app.json` declares an `ACTION_SEND` intent filter for `text/plain`, so Daybook appears in the Android share sheet for any text selection or shared link.

**A capture URL.** The app claims the `daybook` scheme, and `daybook://capture?text=...` creates a task from whatever is in `text`. `SharedCapture` reads it both from a cold start (`getInitialURL`) and while running (the `url` listener), then navigates to [[Unfiled]] so the user sees what landed rather than having to trust it.

On iOS this is also the assistant path: a user-built Shortcut that opens `daybook://capture?text=…` gives Siri capture without the app shipping a native App Intent, and Shortcuts can be triggered by voice, by the share sheet, or from the home screen.

**Shared content is not a task title.** `fromShared` separates the two: a URL in the text becomes the task's body and the remaining words become the title — "Read this https://example.com later" is a task called "Read this later" with the link attached. When the share is nothing *but* a link, the link is the title, because that is the only information there is, and the body is left empty rather than duplicating it.

The remaining words then go through `src/lib/parse.ts`, so a shared "call the plumber tomorrow 30m" arrives dated with an estimate, exactly as if it had been typed into [[Quick Add Sheet]]. `parse` matches both scripts' date words regardless of its language flag — the flag only selects the language of chip labels, which this path never renders — so Arabic shares parse correctly too.

Anything with no date lands on [[Unfiled]], the home [[Undated Unassigned Tasks Have No Screen]] gave these captures, where [[Inbox Triage Chips]] can triage it in one tap.

## Not done: the native targets
Two of the three surfaces in the original scope need native targets, a config plugin and a prebuild, and this project has no `ios/` or `android/` directory and does not verify on an emulator:

- **The iOS share extension.** Appearing in the iOS share sheet requires a Share Extension target in the Xcode project — a separate bundle with its own Info.plist and view controller. It cannot be expressed in `app.json`. The capture URL above is the working substitute until the project takes a prebuild; a Shortcut reaches it from the iOS share sheet, which covers the same user intent through a different door.
- **Native assistant integrations.** iOS App Intents and Android App Actions are two separate native specifications. The Shortcuts route covers iOS in practice; Android App Actions has no equivalent user-buildable path.

Writing Swift and Kotlin for targets that cannot be compiled or run here would leave unverifiable code in the tree, which the project's rules rule out.

## Related
- Page: [[Quick Add Sheet]], [[Main Tabs]], [[Unfiled]]
- Features: [[Natural Language Quick Add]], [[Glass Tab Bar]], [[Pen FAB]], [[Inbox Triage Chips]], [[Offline First Local Store]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Voice Brain Dump Capture]], [[Focus Live Activity and Widgets]]
