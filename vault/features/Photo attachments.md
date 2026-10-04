# Photo attachments

Status: shipped
Summary: Attach photos from the library or camera to a task or a journal entry, shown as thumbnails; images are saved with the app and survive restarts.

## Details
Built on the generic [[Attachments]] layer. Capture uses `expo-image-picker`: `launchImageLibraryAsync({ mediaTypes: ['images'] })` and `launchCameraAsync`, each behind `requestMediaLibraryPermissionsAsync` / `requestCameraPermissionsAsync` (silent early-return on denial or web). The picked asset's temp `uri` is copied into the app document directory by `persistAttachmentFile` and stored as a `photo` attachment with its `width`/`height`. Thumbnails render with the React Native `Image` component, each with a remove control (`src/components/Attachments.tsx` — `PhotoThumb`; `src/lib/attachments.ts`).

Surfaces: [[Quick Add Sheet]] (a pending thumbnail before the task is saved), [[Task Detail]] and [[Entry Composer]].

## Related
- Page: [[Quick Add Sheet]], [[Task Detail]], [[Entry Composer]]
- Features: [[Attachments]], [[Voice notes]], [[Persistence layer]]
