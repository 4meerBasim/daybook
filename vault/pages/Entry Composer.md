# Entry Composer

Route: `EntryComposer` (full-screen modal) — opened from [[Today]] with an entry id (edit) or `null` (new), and seeded with an optional template id.
Summary: Full-screen journaling composer for writing or editing a daily entry — optional title, a large free-writing body, a daily prompt and template picker for new entries, context metadata on edit, plus save-as-template and delete actions.

## Related
- Connects to: [[Today]] — opened from the daily-note card and the On This Day memories, returns here on save, delete, or close, [[Timeline and Map]] — opened from any entry row or map marker there, returns on save, delete, or close, [[Search]] — tapping an entry result opens it
- Features: [[Daily note]], [[Daily writing prompts]], [[Entry templates]], [[Multiple journals]], [[Auto context metadata (time, location, weather)]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]], [[Persistence layer]], [[Attachments]], [[Photo attachments]], [[Voice notes]]

## Notes
`src/screens/EntryComposerScreen.tsx`. `EntryComposerScreen({ entryId?, initialTemplateId?, onClose })`. New when `entryId` is null/undefined, edit when an id is passed; the existing entry is loaded from `useStore().entries` and prefilled. A `KeyboardAvoidingView` (padding on iOS) keeps the keyboard off the body. The top bar carries a back/close button (`ChevronBackIcon`, flipped under RTL), the `newEntry`/`editEntry` title, and a `saveEntry` button.

For a new, empty entry it shows `todaysPrompt` + `promptForDate` with a `usePrompt` button, and a horizontal template picker from `useTemplates()` with a `blankEntry` option; `initialTemplateId` prefills the body (and title) on mount. Selecting a template sets the body and, if the title is blank, the template name. `saveAsTemplate` (shown when the body is non-empty) calls `addTemplate`. Saving a new entry captures context via `captureContext()` first when `contextEnabled`, then `addEntry` with the current journal and today's day key; editing calls `updateEntry` with no re-capture. An entry with no title and no body just closes without saving. Editing shows a read-only metadata line (time, place, weather) and a `delete` action.

While editing an existing entry the composer also shows an Attachments block (`AttachmentsSection entryId={existing.id}` from `src/components/Attachments.tsx`) — the same capture bar, photo thumbnails and audio playback rows used on [[Task Detail]], bound to the entry. It appears once the entry has an id (a brand-new note is saved first, then reopened to attach). See [[Photo attachments]], [[Voice notes]] and the [[Attachments]] layer.
