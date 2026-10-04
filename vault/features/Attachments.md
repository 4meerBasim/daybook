# Attachments

Status: shipped
Summary: A generic attachments layer — a table, store actions and on-device file persistence — that binds a photo or audio file to exactly one task or one journal entry.

## Details
The shared infrastructure beneath [[Photo attachments]] and [[Voice notes]].

Data model: `Attachment` in `src/data/seed.ts` — `{ id, taskId | null, entryId | null, kind: 'photo' | 'audio', uri, durationMs | null, width | null, height | null, createdAt }`, with exactly one of `taskId`/`entryId` set.

Persistence: an `attachments` table in `src/lib/db.ts` (indexed on `taskId` and `entryId`, with the standard `updatedAt`/`deletedAt` soft-delete columns), `upsertAttachment` / `deleteAttachmentRow` writers and a `loadSnapshot` read, following the subtasks pattern — see [[Persistence layer]].

Store (`src/state/store.tsx`): `attachments` state, `addAttachment` (generates `att{n}` ids, sets `createdAt`, persists) and `removeAttachment` (soft-delete + best-effort file delete), with `useTaskAttachments(taskId)` / `useEntryAttachments(entryId)` selectors. Deleting a task or entry cascades to soft-delete its attachments. `addTask` now returns the created `Task` so a capture surface can bind attachments to the new id.

File persistence (`src/lib/attachments.ts`): captured photo/audio come back as temp/cache URIs; `persistAttachmentFile` copies each into an `attachments/` subfolder of the document directory with a stable filename (new `expo-file-system` `File`/`Paths`/`Directory` API) before the `Attachment.uri` is saved, so files survive restarts. `deleteAttachmentFile` removes a file best-effort inside try/catch. Degrades gracefully on web by falling back to the original uri.

Config: `expo-image-picker` and `expo-audio` config plugins with permission strings live in `app.json`; `expo-file-system` needs no plugin.

## Related
- Page: [[Quick Add Sheet]], [[Task Detail]], [[Entry Composer]]
- Features: [[Photo attachments]], [[Voice notes]], [[Persistence layer]]
