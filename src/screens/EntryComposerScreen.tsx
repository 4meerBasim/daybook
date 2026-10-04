import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { useStore, useTemplates } from '../state/store';
import { EntryTemplate } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { ChevronBackIcon } from '../components/Icon';
import { AttachmentsSection } from '../components/Attachments';
import { dayKey, formatTime } from '../lib/day';
import { captureContext, formatWeather } from '../lib/context';
import { promptForDate } from '../data/prompts';

function firstLine(value: string): string {
  return value.split('\n')[0].trim();
}

export function EntryComposerScreen({
  entryId,
  initialTemplateId,
  onClose,
}: {
  entryId?: string | null;
  initialTemplateId?: string | null;
  onClose: () => void;
}) {
  const { c, t, ar, lang, ui, mono, display, rtl } = useTheme();
  const {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    addTemplate,
    currentJournalId,
    contextEnabled,
  } = useStore();
  const templates = useTemplates();
  const top = useHeaderTop();

  const editing = !!entryId;
  const existing = editing ? entries.find((e) => e.id === entryId) : undefined;
  const initialTemplate =
    !editing && initialTemplateId ? templates.find((tpl) => tpl.id === initialTemplateId) : undefined;

  const [title, setTitle] = useState(() => existing?.title ?? initialTemplate?.name ?? '');
  const [body, setBody] = useState(() => existing?.body ?? initialTemplate?.body ?? '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(() =>
    editing ? existing?.templateId ?? null : initialTemplateId ?? null
  );
  const [saving, setSaving] = useState(false);

  const prompt = promptForDate(new Date(), lang);
  const showHelpers = !editing && body.trim() === '';

  const applyTemplate = (tpl: EntryTemplate) => {
    setBody(tpl.body);
    setSelectedTemplateId(tpl.id);
    setTitle((cur) => (cur.trim() === '' ? tpl.name : cur));
  };

  const applyBlank = () => {
    setBody('');
    setSelectedTemplateId(null);
  };

  const saveAsTemplate = () => {
    if (body.trim() === '') return;
    const name = title.trim() || firstLine(body).slice(0, 40);
    addTemplate({ name, body });
  };

  const deleteEntry = () => {
    if (entryId) removeEntry(entryId);
    onClose();
  };

  const save = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === '' && body.trim() === '') {
      onClose();
      return;
    }
    if (editing && entryId) {
      updateEntry(entryId, { title: trimmedTitle, body });
      onClose();
      return;
    }
    const day = dayKey(new Date());
    if (contextEnabled) {
      setSaving(true);
      const ctx = await captureContext();
      addEntry({
        journalId: currentJournalId,
        day,
        title: trimmedTitle,
        body,
        templateId: selectedTemplateId,
        placeName: ctx.placeName,
        lat: ctx.lat,
        lng: ctx.lng,
        tempC: ctx.tempC,
        weatherCode: ctx.weatherCode,
      });
    } else {
      addEntry({
        journalId: currentJournalId,
        day,
        title: trimmedTitle,
        body,
        templateId: selectedTemplateId,
        placeName: null,
        lat: null,
        lng: null,
        tempC: null,
        weatherCode: null,
      });
    }
    onClose();
  };

  const metaLine =
    editing && existing
      ? [
          formatTime(existing.createdAt, ar),
          existing.placeName ?? '',
          formatWeather(existing.tempC, existing.weatherCode, t),
        ]
          .filter((part) => part !== '')
          .join(' · ')
      : '';

  const showFooter = body.trim() !== '' || editing;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            paddingTop: top + 6,
            paddingHorizontal: metrics.gutter,
            paddingBottom: 8,
            flexDirection: row(rtl),
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: c.rule,
          }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={metrics.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            android_ripple={null}
            style={{
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: rtl ? 'flex-end' : 'flex-start',
            }}
          >
            <ChevronBackIcon color={c.ink2} flip={rtl} />
          </Pressable>
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.4}
            style={[display(16, { lineHeight: 22 }), { flex: 1, color: c.ink, textAlign: 'center' }]}
          >
            {editing ? t.editEntry : t.newEntry}
          </Text>
          <Pressable
            onPress={save}
            disabled={saving}
            hitSlop={metrics.hitSlop}
            accessibilityRole="button"
            accessibilityState={{ disabled: saving }}
            accessibilityLabel={t.saveEntry}
            android_ripple={null}
            style={{
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: rtl ? 'flex-start' : 'flex-end',
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Text style={[ui(16, 500), { color: c.ink, lineHeight: undefined }]}>{t.saveEntry}</Text>
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t.entryTitlePlaceholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.entryTitlePlaceholder}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              display(24, { lineHeight: 30 }),
              {
                paddingHorizontal: metrics.gutter,
                paddingTop: 14,
                paddingBottom: 6,
                color: c.ink,
                textAlign: align(rtl),
              },
            ]}
          />

          {metaLine !== '' ? (
            <Text
              style={[
                mono(12, 500, 0, true),
                { paddingHorizontal: metrics.gutter, paddingBottom: 2, color: c.ink3, textAlign: align(rtl) },
              ]}
            >
              {metaLine}
            </Text>
          ) : null}

          {showHelpers ? (
            <View style={{ paddingHorizontal: metrics.gutter, paddingTop: 6, gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
                  {t.todaysPrompt}
                </Text>
                <Text style={[display(17, { lineHeight: 24 }), { color: c.ink2, textAlign: align(rtl) }]}>
                  {prompt}
                </Text>
                <Pressable
                  onPress={() => setBody(prompt)}
                  hitSlop={metrics.hitSlop}
                  accessibilityRole="button"
                  accessibilityLabel={t.usePrompt}
                  android_ripple={null}
                  style={{
                    minHeight: 44,
                    justifyContent: 'center',
                    alignSelf: rtl ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Text
                    style={[
                      ui(14, 500),
                      { color: c.ink, lineHeight: undefined, textDecorationLine: 'underline' },
                    ]}
                  >
                    {t.usePrompt}
                  </Text>
                </Pressable>
              </View>

              <View accessibilityRole="radiogroup" accessibilityLabel={t.templates}>
                <Text
                  style={[
                    mono(11, 500, 0.1, true),
                    { color: c.ink3, textAlign: align(rtl), marginBottom: 8 },
                  ]}
                >
                  {t.templates}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 8, flexDirection: row(rtl) }}
                >
                  <TemplateChip
                    label={t.blankEntry}
                    on={selectedTemplateId === null}
                    onPress={applyBlank}
                  />
                  {templates.map((tpl) => (
                    <TemplateChip
                      key={tpl.id}
                      label={tpl.name}
                      on={selectedTemplateId === tpl.id}
                      onPress={() => applyTemplate(tpl)}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>
          ) : null}

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t.entryPlaceholder}
            placeholderTextColor={c.ink3}
            selectionColor={c.ink}
            accessibilityLabel={t.entryPlaceholder}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              ui(17, 400, 26),
              {
                flexGrow: 1,
                minHeight: 240,
                paddingHorizontal: metrics.gutter,
                paddingTop: 10,
                paddingBottom: 16,
                color: c.ink,
                textAlign: align(rtl),
              },
            ]}
          />

          {editing && existing ? (
            <View
              style={{
                paddingHorizontal: metrics.gutter,
                paddingVertical: 16,
                gap: 12,
                borderTopWidth: 1,
                borderTopColor: c.rule,
              }}
            >
              <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
                {t.attachments}
              </Text>
              <AttachmentsSection entryId={existing.id} />
            </View>
          ) : null}

          {showFooter ? (
            <View
              style={{
                flexDirection: row(rtl),
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: metrics.gutter,
                paddingVertical: 12,
                gap: 16,
                borderTopWidth: 1,
                borderTopColor: c.rule,
              }}
            >
              {body.trim() !== '' ? (
                <Pressable
                  onPress={saveAsTemplate}
                  hitSlop={metrics.hitSlop}
                  accessibilityRole="button"
                  accessibilityLabel={t.saveAsTemplate}
                  android_ripple={null}
                  style={{ minHeight: 44, justifyContent: 'center' }}
                >
                  <Text style={[ui(14, 500), { color: c.ink2, lineHeight: undefined }]}>
                    {t.saveAsTemplate}
                  </Text>
                </Pressable>
              ) : (
                <View />
              )}
              {editing ? (
                <Pressable
                  onPress={deleteEntry}
                  hitSlop={metrics.hitSlop}
                  accessibilityRole="button"
                  accessibilityLabel={t.delete}
                  android_ripple={null}
                  style={{ minHeight: 44, justifyContent: 'center' }}
                >
                  <Text style={[ui(14, 500), { color: c.ver, lineHeight: undefined }]}>{t.delete}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function TemplateChip({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  const { c, ui } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: on ? c.ink : c.rule,
        backgroundColor: on ? c.paper2 : 'transparent',
      }}
    >
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={1.4}
        style={[ui(13, 500), { color: on ? c.ink : c.ink2, lineHeight: undefined }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
