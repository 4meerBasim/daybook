# Voice Brain Dump Capture

Status: shipped
Summary: Dictate or write everything at once; it becomes a reviewable page of parsed tasks, with the original audio kept attached.

## Details
Typing seven tasks one at a time is why things never get written down. The pipeline is: dump → split → parse → review → commit, with the audio preserved alongside.

**A dump is a note.** This is the structural decision that makes the feature cheap and correct. The committed dump creates a note titled "Brain dump, Monday, 3 November" whose lines are the parsed items, each promoted to a real task through [[Notes With Live Task Lines]]'s existing line/task link, with the audio attached to the note. There is no new "dump" entity, the items are editable afterwards on a ruled page, and striking one anywhere strikes it everywhere — all of that comes for free from the notes model.

**Splitting.** `splitDump` breaks the text on newlines, on sentence terminators (including the Arabic `؟`), and on spoken connectives — "and then", "then also", "also,", Arabic `ثم`. It strips list bullets and trailing punctuation. Verified on both scripts: "call the plumber tomorrow. buy oat milk 15m. book flights next week" becomes three items, and so does its Arabic equivalent.

**Parsing.** Each item runs through `src/lib/parse.ts`, so dates, times, tags, priority and [[Day Capacity Budget]]'s durations all resolve exactly as if typed into [[Quick Add Sheet]]. The user sees a page of tasks with chips, never a model.

**Review before commit, which the note required.** Nothing is written until the review step. Each item is a ruled row with a checkbox and its parsed chips; unticking drops it. The button counts what will be kept — "Keep these 5" — so a bad parse costs one tap per wrong row instead of twelve wrong rows in the list. Items with no date land on [[Unfiled]], where [[Inbox Triage Chips]] can place them.

**Audio.** `expo-audio` records, `expo-file-system` measures the file, and schema v10's `attachments` table stores uri, bytes and duration against either a note or a task — `CHECK ((noteId IS NULL) <> (taskId IS NULL))` enforces exactly one owner, verified against sqlite. The [[Note]] screen shows a real attachment row with the clip's length and size. Declining the microphone is not fatal: the screen says so and the written dump still works.

Reached by long-pressing the Add item in [[Glass Tab Bar]] — tap to type one task, hold to dump many. The tab bar previously refused to pass a long-press for `add` at all.

**A dependency fix came with this.** `expo-audio@57.0.5` declares `expo-asset@58`, which reaches for an `expo/internal/bundle-origin` export that does not exist in SDK 57, and the bundle failed outright. `package.json` now pins `expo-asset` to `~57.0.20` through `overrides`. `expo` and `expo-sqlite` also moved to their SDK-57 patch versions, which `expo-doctor` was already asking for.

## Transcription: the system keyboard, not a model
The note left the transcription route open — on-device versus server-side — and flagged that on-device is weaker on Arabic, which matters because [[In-App RTL and Arabic Typography]] is first-class here.

The route taken is **the system keyboard's own dictation**. The dump field is a large multi-line input, and the user taps the microphone on their keyboard and speaks. That is on-device recognition, from the vendor whose Arabic model is the best one available on the device, with no dependency, no API key, no network and no audio leaving the phone — which is the only route consistent with a local-first app that has no backend.

What this does **not** include is the app transcribing the recorded audio file itself. Doing that needs either a third-party native speech module (not an Expo SDK package; it cannot be added to a managed project without a prebuild, and cannot be verified here) or a cloud STT endpoint and a key. The recording is therefore kept as the record of what was said — which is the note's "nothing is lost when the parse is imperfect" — rather than as the input to a transcriber. If a prebuild happens, the recorded clip is already stored and addressable, so adding a transcriber later is a new provider, not a new pipeline.

## Related
- Page: [[Quick Add Sheet]], [[Today]], [[Task Detail]], [[Brain Dump]], [[Note]], [[Notes]], [[Unfiled]]
- Features: [[Natural Language Quick Add]], [[In-App RTL and Arabic Typography]], [[Notes With Live Task Lines]], [[Day Capacity Budget]], [[Inbox Triage Chips]], [[Glass Tab Bar]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[System Capture Entry Points]]
