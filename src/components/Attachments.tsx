import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { insetEnd, row } from '../lib/rtl';
import { toArabicDigits } from '../lib/day';
import {
  capturePhotoFromCamera,
  deleteAttachmentFile,
  formatDuration,
  persistAttachmentFile,
  pickPhotoFromLibrary,
} from '../lib/attachments';
import type { Attachment } from '../data/seed';
import {
  useEntryAttachments,
  useStore,
  useTaskAttachments,
} from '../state/store';
import {
  CameraIcon,
  CloseIcon,
  ImageIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from './Icon';

export type VoiceCapture = {
  isRecording: boolean;
  durationMs: number;
  start: () => Promise<boolean>;
  stop: () => Promise<{ uri: string; durationMs: number } | null>;
};

export function useVoiceCapture(): VoiceCapture {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  const start = async () => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return false;
    await recorder.prepareToRecordAsync();
    recorder.record();
    return true;
  };

  const stop = async () => {
    const durationMs = recorder.getStatus().durationMillis;
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return null;
    const persisted = await persistAttachmentFile(uri, 'audio');
    return { uri: persisted, durationMs };
  };

  return { isRecording: state.isRecording, durationMs: state.durationMillis, start, stop };
}

export function CaptureBar({
  onPickPhoto,
  onCamera,
  voice,
}: {
  onPickPhoto: () => void;
  onCamera: () => void;
  voice: { isRecording: boolean; durationMs: number; onToggle: () => void };
}) {
  const { c, t, ui, rtl, ar } = useTheme();
  return (
    <View style={{ flexDirection: row(rtl), gap: 8, flexWrap: 'wrap' }}>
      <ToolButton icon={<ImageIcon size={18} color={c.ink2} />} label={t.photo} onPress={onPickPhoto} />
      <ToolButton icon={<CameraIcon size={18} color={c.ink2} />} label={t.camera} onPress={onCamera} />
      <Pressable
        onPress={voice.onToggle}
        android_ripple={null}
        accessibilityRole="button"
        accessibilityLabel={voice.isRecording ? t.stopRecording : t.voiceNote}
        style={{
          minHeight: 36,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          borderRadius: radius.chip,
          borderWidth: 1,
          borderColor: voice.isRecording ? c.ver : c.rule,
          backgroundColor: voice.isRecording ? c.verS : 'transparent',
        }}
      >
        <MicIcon size={18} color={voice.isRecording ? c.ver : c.ink2} />
        <Text style={[ui(13, 500), { lineHeight: undefined, color: voice.isRecording ? c.ver : c.ink2 }]}>
          {voice.isRecording ? `${t.recording} ${toArabicDigits(formatDuration(voice.durationMs), ar)}` : t.voiceNote}
        </Text>
      </Pressable>
    </View>
  );
}

function ToolButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { c, ui, rtl } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        minHeight: 36,
        flexDirection: row(rtl),
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: c.rule,
      }}
    >
      {icon}
      <Text style={[ui(13, 500), { lineHeight: undefined, color: c.ink2 }]}>{label}</Text>
    </Pressable>
  );
}

export function PhotoThumb({
  uri,
  onRemove,
}: {
  uri: string;
  onRemove: () => void;
}) {
  const { c, t, rtl } = useTheme();
  return (
    <View style={{ width: 72, height: 72 }}>
      <Image
        source={{ uri }}
        accessibilityLabel={t.photoAttachment}
        style={{ width: 72, height: 72, borderRadius: radius.chip, backgroundColor: c.paper2 }}
      />
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t.removeAttachment}
        android_ripple={null}
        style={{
          position: 'absolute',
          top: -6,
          ...insetEnd(rtl, -6),
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: c.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloseIcon size={14} color={c.paper} />
      </Pressable>
    </View>
  );
}

export function AudioAttachmentRow({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: () => void;
}) {
  const { c, t, ui, mono, rtl, ar } = useTheme();
  const player = useAudioPlayer(attachment.uri);
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;

  const toggle = () => {
    if (playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
      void player.seekTo(0);
    }
    player.play();
  };

  const ms = attachment.durationMs ?? (status.duration > 0 ? status.duration * 1000 : 0);

  return (
    <View
      style={{
        flexDirection: row(rtl),
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
      }}
    >
      <Pressable
        onPress={toggle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={playing ? t.pauseAudio : t.playAudio}
        android_ripple={null}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: c.rule,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {playing ? <PauseIcon size={20} color={c.ink} /> : <PlayIcon size={20} color={c.ink} />}
      </Pressable>
      <View style={{ flex: 1, flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
        <MicIcon size={16} color={c.ink3} />
        <Text style={[ui(14, 500), { lineHeight: undefined, color: c.ink }]}>{t.voiceNote}</Text>
      </View>
      <Text style={[mono(13, 500), { color: c.ink2 }]}>{toArabicDigits(formatDuration(ms), ar)}</Text>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t.removeAttachment}
        android_ripple={null}
      >
        <TrashIcon size={20} color={c.ink3} />
      </Pressable>
    </View>
  );
}

export function AttachmentsSection({
  taskId,
  entryId,
}: {
  taskId?: string;
  entryId?: string;
}) {
  const { c, rtl } = useTheme();
  const { addAttachment, removeAttachment } = useStore();
  const taskAttachments = useTaskAttachments(taskId ?? '');
  const entryAttachments = useEntryAttachments(entryId ?? '');
  const list = taskId ? taskAttachments : entryAttachments;
  const voice = useVoiceCapture();
  const [busy, setBusy] = useState(false);

  const bind = () => ({ taskId: taskId ?? null, entryId: entryId ?? null });

  const onPickPhoto = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const asset = await pickPhotoFromLibrary();
      if (asset) {
        const uri = await persistAttachmentFile(asset.uri, 'photo');
        addAttachment({ ...bind(), kind: 'photo', uri, durationMs: null, width: asset.width ?? null, height: asset.height ?? null });
      }
    } finally {
      setBusy(false);
    }
  };

  const onCamera = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const asset = await capturePhotoFromCamera();
      if (asset) {
        const uri = await persistAttachmentFile(asset.uri, 'photo');
        addAttachment({ ...bind(), kind: 'photo', uri, durationMs: null, width: asset.width ?? null, height: asset.height ?? null });
      }
    } finally {
      setBusy(false);
    }
  };

  const onToggleVoice = async () => {
    if (voice.isRecording) {
      const result = await voice.stop();
      if (result) {
        addAttachment({ ...bind(), kind: 'audio', uri: result.uri, durationMs: result.durationMs, width: null, height: null });
      }
      return;
    }
    await voice.start();
  };

  const photos = list.filter((a) => a.kind === 'photo');
  const audios = list.filter((a) => a.kind === 'audio');

  return (
    <View style={{ gap: 12 }}>
      <CaptureBar
        onPickPhoto={onPickPhoto}
        onCamera={onCamera}
        voice={{ isRecording: voice.isRecording, durationMs: voice.durationMs, onToggle: onToggleVoice }}
      />
      {photos.length ? (
        <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 12 }}>
          {photos.map((a) => (
            <PhotoThumb key={a.id} uri={a.uri} onRemove={() => removeAttachment(a.id)} />
          ))}
        </View>
      ) : null}
      {audios.length ? (
        <View style={{ borderTopWidth: audios.length ? 1 : 0, borderTopColor: c.rule }}>
          {audios.map((a) => (
            <AudioAttachmentRow key={a.id} attachment={a} onRemove={() => removeAttachment(a.id)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
