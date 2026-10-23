import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { longDate } from '../lib/date';
import { useStore } from '../state/store';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger, useRuling } from '../components/Ledger';
import { NameSheet } from '../components/NameSheet';
import { ChevronBackIcon, PlusIcon } from '../components/Icon';

export function NotesScreen({
  onBack,
  onOpenNote,
}: {
  onBack: () => void;
  onOpenNote: (noteId: string) => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { notes, createNote } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const [naming, setNaming] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
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
            {t.notesTitle}
          </Text>

          {notes.length ? null : (
            <Text
              style={[
                display(15, { weight: 400, italic: true }),
                { color: c.ink3, marginTop: 4, textAlign: align(rtl) },
              ]}
            >
              {t.notesEmpty}
            </Text>
          )}
        </View>

        <Ledger>
          {notes.map((note) => (
            <NoteRow key={note.id} onPress={() => onOpenNote(note.id)}>
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[ui(17, 400, 22), { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) }]}
              >
                {note.title}
              </Text>
              <Text numberOfLines={1} style={[mono(11, 500, 0.1), { color: c.ink3 }]}>
                {longDate(note.updatedAt, t)}
              </Text>
            </NoteRow>
          ))}

          <NoteRow onPress={() => setNaming(true)}>
            <PlusIcon size={18} color={c.ink3} />
            <Text style={[ui(15), { flex: 1, color: c.ink3, textAlign: align(rtl) }]}>
              {t.newNote}
            </Text>
          </NoteRow>

          <EmptyRules count={notes.length ? 2 : 4} />
        </Ledger>
      </ScrollView>

      {naming ? (
        <NameSheet
          initial=""
          placeholder={t.noteTitle}
          onClose={() => setNaming(false)}
          onSubmit={async (title) => {
            if (!title) return;
            const id = await createNote(title);
            onOpenNote(id);
          }}
        />
      ) : null}
    </Screen>
  );
}

function NoteRow({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const { c, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
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
          pad(rtl, metrics.content, metrics.gutter),
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
}
