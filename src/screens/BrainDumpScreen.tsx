import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { File } from 'expo-file-system';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { longDate } from '../lib/date';
import { chipColors, draft as toDraft, parse } from '../lib/parse';
import { splitDump } from '../lib/dump';
import { useStore } from '../state/store';
import { PRIORITY_HIGH } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { Checkbox, EmptyRules, Ledger, useRuling } from '../components/Ledger';
import { Chip } from '../components/Chip';
import { ChevronBackIcon } from '../components/Icon';

type Item = { text: string; keep: boolean };

function ReviewRow({
  item,
  onToggle,
}: {
  item: Item;
  onToggle: () => void;
}) {
  const { c, t, ar, ui, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  const parsed = parse(item.text, ar, t);
  const built = toDraft(parsed, Date.now());

  return (
    <Pressable
      onPress={onToggle}
      android_ripple={null}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.keep }}
      accessibilityLabel={item.text}
      style={({ pressed }) => ({
        height,
        justifyContent: 'center',
        backgroundColor: pressed ? c.paper2 : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      })}
    >
      <View
        onLayout={onContentLayout}
        style={[
          {
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: metrics.gap,
            paddingVertical: metrics.rowPad,
          },
          pad(rtl, 16, metrics.gutter),
        ]}
      >
        <Checkbox checked={item.keep} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              ui(17, 400, 22),
              { color: item.keep ? c.ink : c.ink3, textAlign: align(rtl) },
            ]}
          >
            {built.title || item.text}
          </Text>
          {parsed.chips.length ? (
            <View style={{ flexDirection: row(rtl), gap: 6, flexWrap: 'wrap' }}>
              {parsed.chips.map((chip, i) => (
                <Chip key={i} label={chip.label} {...chipColors(chip.kind, c)} />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function BrainDumpScreen({
  onBack,
  onCommitted,
}: {
  onBack: () => void;
  onCommitted: (noteId: string) => void;
}) {
  const { c, t, ar, ui, mono, display, rtl, reduced } = useTheme();
  const { createDump } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [text, setText] = useState('');
  const [items, setItems] = useState<Item[] | null>(null);
  const [audio, setAudio] = useState<{ uri: string; bytes: number; durationMs: number } | null>(
    null
  );
  const [micDenied, setMicDenied] = useState(false);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  }, []);

  const startRecording = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setMicDenied(true);
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const stopRecording = async () => {
    const durationMs = recorderState.durationMillis;
    await recorder.stop();
    if (!recorder.uri) return;
    const file = new File(recorder.uri);
    setAudio({ uri: recorder.uri, bytes: file.size ?? 0, durationMs });
  };

  const review = () => {
    const split = splitDump(text);
    setItems(split.map((line) => ({ text: line, keep: true })));
  };

  const commit = async () => {
    if (!items) return;
    const kept = items.filter((item) => item.keep);
    if (!kept.length) return;

    const noteId = await createDump(
      t.brainDumpTitle.replace('{date}', longDate(Date.now(), t)),
      kept.map((item) => {
        const built = toDraft(parse(item.text, ar, t), Date.now());
        return {
          text: built.title || item.text,
          task: {
            title: built.title || item.text,
            tags: built.tags,
            dueDate: built.dueDate,
            duration: built.duration,
            priority: built.high ? PRIORITY_HIGH : null,
          },
        };
      }),
      audio
    );
    onCommitted(noteId);
  };

  const seconds = Math.floor(recorderState.durationMillis / 1000);
  const keptCount = items ? items.filter((item) => item.keep).length : 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <View style={{ flexDirection: row(rtl), marginBottom: 4 }}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t.back}
              android_ripple={null}
              style={{
                width: metrics.minTap,
                height: metrics.minTap,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronBackIcon color={c.ink2} flip={rtl} />
            </Pressable>
          </View>

          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.brainDump}
          </Text>
          <Text
            style={[ui(15, 400, 22), { color: c.ink2, marginTop: 4, textAlign: align(rtl) }]}
          >
            {t.brainDumpHint}
          </Text>
        </View>

        {items ? (
          <Ledger>
            {items.map((item, i) => (
              <ReviewRow
                key={`${i}-${item.text}`}
                item={item}
                onToggle={() =>
                  setItems((prev) =>
                    prev
                      ? prev.map((other, j) =>
                          j === i ? { ...other, keep: !other.keep } : other
                        )
                      : prev
                  )
                }
              />
            ))}
            <EmptyRules count={items.length ? 1 : 3} />
          </Ledger>
        ) : (
          <View style={{ paddingHorizontal: metrics.gutter, gap: 16 }}>
            <View style={{ borderBottomWidth: 1.5, borderBottomColor: c.ink, paddingBottom: 10 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                autoFocus={!reduced}
                multiline
                placeholder={t.brainDumpPlaceholder}
                placeholderTextColor={c.ink3}
                selectionColor={c.ink}
                accessibilityLabel={t.brainDump}
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                textAlignVertical="top"
                style={[
                  ui(17, 400, 26),
                  { minHeight: 160, color: c.ink, padding: 0, textAlign: align(rtl) },
                ]}
              />
            </View>

            <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: metrics.gap }}>
              <Pressable
                onPress={recorderState.isRecording ? stopRecording : startRecording}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={recorderState.isRecording ? t.stopRecording : t.recordAudio}
                style={{
                  minHeight: metrics.minTap,
                  paddingHorizontal: 18,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: recorderState.isRecording ? c.ver : c.ink,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={[
                    ui(15, 500),
                    { lineHeight: undefined, color: recorderState.isRecording ? c.ver : c.ink },
                  ]}
                >
                  {recorderState.isRecording ? t.stopRecording : t.recordAudio}
                </Text>
              </Pressable>

              {recorderState.isRecording ? (
                <Text style={[mono(13, 500), { color: c.ver }]}>
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                  {String(seconds % 60).padStart(2, '0')}
                </Text>
              ) : null}

              {audio && !recorderState.isRecording ? (
                <Text style={[mono(12, 500), { color: c.ink3 }]}>
                  {t.audioAttached.replace(
                    '{s}',
                    String(Math.round(audio.durationMs / 1000))
                  )}
                </Text>
              ) : null}
            </View>

            {micDenied ? (
              <Text style={[mono(12, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
                {t.micDenied}
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: bottom + 16,
          left: metrics.gutter,
          right: metrics.gutter,
        }}
      >
        <Pressable
          onPress={items ? commit : review}
          disabled={items ? keptCount === 0 : text.trim().length < 2}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={items ? t.keepThese : t.sortItOut}
          style={{
            minHeight: metrics.ruling,
            borderRadius: radius.card,
            backgroundColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (items ? keptCount === 0 : text.trim().length < 2) ? 0.4 : 1,
          }}
        >
          <Text style={[ui(17, 500), { color: c.paper }]}>
            {items ? t.keepThese.replace('{n}', String(keptCount)) : t.sortItOut}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
