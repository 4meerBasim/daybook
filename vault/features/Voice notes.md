# Voice notes

Status: shipped
Summary: Record a voice note and play it back on a task or a journal entry; recordings are saved with the app and survive restarts.

## Details
Built on the generic [[Attachments]] layer. Recording uses `expo-audio` (the current API, not the deprecated `expo-av`): `useAudioRecorder(RecordingPresets.HIGH_QUALITY)` with `useAudioRecorderState` for the live elapsed time, `requestRecordingPermissionsAsync` before the first record, then `prepareToRecordAsync()` → `record()` → `stop()`. The recorder's temp `uri` is copied into the app document directory by `persistAttachmentFile` and stored as an `audio` attachment with its `durationMillis`. Playback is `useAudioPlayer` + `useAudioPlayerStatus` with a play/pause control and the duration (`src/components/Attachments.tsx` — `useVoiceCapture`, `AudioAttachmentRow`; `src/lib/attachments.ts`).

Recording and playback surface on the [[Quick Add Sheet]] (a pending audio chip before the task is saved, with playback once it is), [[Task Detail]] and [[Entry Composer]]. Permission denial and web early-return silently without crashing. Transcription is NOT implemented — this note is scoped to record/playback only.

## Related
- Page: [[Quick Add Sheet]], [[Task Detail]], [[Entry Composer]]
- Features: [[Attachments]], [[Photo attachments]], [[Persistence layer]]
