import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const ATTACH_DIR = 'attachments';

function attachmentsDir(): Directory {
  const dir = new Directory(Paths.document, ATTACH_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export async function persistAttachmentFile(
  sourceUri: string,
  kind: 'photo' | 'audio'
): Promise<string> {
  try {
    const src = new File(sourceUri);
    const ext = src.extension || (kind === 'photo' ? '.jpg' : '.m4a');
    const name = `${kind}-${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;
    const dest = new File(attachmentsDir(), name);
    await src.copy(dest);
    return dest.uri;
  } catch {
    return sourceUri;
  }
}

export function formatDuration(ms: number | null | undefined): string {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function deleteAttachmentFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // best effort: never throw when cleaning up a missing or inaccessible file
  }
}

export async function pickPhotoFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (res.canceled || !res.assets.length) return null;
  return res.assets[0];
}

export async function capturePhotoFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  if (res.canceled || !res.assets.length) return null;
  return res.assets[0];
}
